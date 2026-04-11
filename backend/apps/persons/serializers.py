# apps/persons/serializers.py

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from datetime import date

from .services import create_student

from .models import Person, Student, Parent, Employee, Teacher
from .academic.serializers import LanguageSerializer, PositionSerializer
from apps.academic.models import Language , Position



def validate_date_of_birth(value):
    if value > date.today():
        raise serializers.ValidationError("Date of birth cannot be in the future.")
    return value







class PersonSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name  = serializers.CharField(max_length=50)
    gender     = serializers.ChoiceField(choices=['male', 'female'])
    phone = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=Person.objects.all(),
                message="Phone number already exists."
            )
        ]
    )
    email = serializers.EmailField(
        required=False,
        allow_null=True,
        validators=[
            UniqueValidator(
                queryset=Person.objects.all(),
                message="Email already exists."
            )
        ]
    )
    address = serializers.CharField(required=False, allow_null=True)


# create serializers

class StudentCreateSerializer(PersonSerializer):
    date_of_birth = serializers.DateField(validators=[validate_date_of_birth]) 
    special_case = serializers.CharField(required=False, allow_null=True) 
    parent_id = serializers.IntegerField(required=False, allow_null=True)
    

    def validate(self, data):
        dob = data['date_of_birth']
        parent_id = data.get('parent_id')
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 18 and not parent_id:
            raise serializers.ValidationError({'parent_id': "Minor students must have a parent linked."})
        return data

    def create(self, validated_data): 
        from .services import create_student 
        return create_student(validated_data) 
    def update(self, instance, validated_data): 
        return super().update(instance, validated_data)
    
    def update(self, instance, validated_data):
        person_data = validated_data.pop('person', {})
        for key, value in person_data.items():
            setattr(instance.person, key, value)
        instance.person.save()

        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance


class ParentCreateSerializer(PersonSerializer):
    relationship = serializers.ChoiceField(choices=['father', 'mother', 'other'])
    student_ids  = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list
    )

    def create(self, validated_data):
        from .services import create_parent
        return create_parent(validated_data)
    
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class EmployeeCreateSerializer(PersonSerializer):
    hire_date   = serializers.DateField()
    position_id = serializers.IntegerField()

    def validate_position_id(self, value):
        if not Position.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Position not found.")
        return value

    def validate_hire_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Hire date cannot be in the future.")
        return value

    def create(self, validated_data):
        from .services import create_employee
        return create_employee(validated_data)
    
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class TeacherCreateSerializer(EmployeeCreateSerializer):
    qualifications  = serializers.CharField(required=False, allow_null=True)
    language_id     = serializers.IntegerField(required=False, allow_null=True)
    is_head_teacher = serializers.BooleanField(default=False)

    def validate_language_id(self, value):
        if value and not Language.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Language not found.")
        return value

    def create(self, validated_data):
        from .services import create_teacher
        return create_teacher(validated_data)
    
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


#read serializers

class StudentSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    class Meta:
        model = Student
        fields = [
         'person', 'date_of_birth', 'special_case'
        ]

class ParentSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)

    class Meta:
        model = Parent
        fields = ['person', 'relationship']


class EmployeeSerializer(serializers.ModelSerializer):
    person   = PersonSerializer(read_only=True)
    position = PositionSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = ['person', 'position', 'hire_date', 'end_date', 'status']


class TeacherSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)

    class Meta:
        model = Teacher
        fields = ['employee', 'qualifications', 'language', 'is_head_teacher']