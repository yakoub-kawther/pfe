# apps/persons/serializers.py

from rest_framework import serializers , generics
from rest_framework.validators import UniqueValidator
from datetime import date

from .services import create_student

from .models import Person, Student, Parent, Employee, Teacher
from apps.academic.serializers import LanguageSerializer, PositionSerializer
from apps.academic.models import Language , Position



def validate_date_of_birth(value):
    if value > date.today():
        raise serializers.ValidationError("Date of birth cannot be in the future.")
    return value







class PersonSerializer(serializers.Serializer):
    id         = serializers.IntegerField(read_only=True)
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
    special_case  = serializers.CharField(required=False, allow_null=True)
    parent_id     = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, data):
        dob       = data['date_of_birth']
        parent_id = data.get('parent_id')
        today     = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 18 and not parent_id:
            raise serializers.ValidationError({'parent_id': "Minor students must have a parent linked."})
        return data

    def create(self, validated_data):
        from .services import create_student
        return create_student(validated_data)

    def update(self, instance, validated_data):
        from .services import update_student
        return update_student(instance, validated_data)  


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
        from .services import update_parent
        return update_parent(instance, validated_data)  
class EmployeeCreateSerializer(PersonSerializer):
    hire_date   = serializers.DateField()
    position_id = serializers.IntegerField()
    status      = serializers.ChoiceField(choices=['active', 'inactive'], default='active')
    username    = serializers.CharField(required=False, allow_null=True)  # ← add
    password    = serializers.CharField(required=False, allow_null=True)

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
       from .services import update_employee
       return update_employee(instance, validated_data)

        


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
        # Update employee (and person) via parent
        super().update(instance.employee, validated_data)

        # Update teacher-specific fields
        instance.qualifications  = validated_data.get('qualifications',  instance.qualifications)
        instance.is_head_teacher = validated_data.get('is_head_teacher', instance.is_head_teacher)
        if 'language_id' in validated_data:
            lang_id = validated_data['language_id']
            instance.language = Language.objects.get(pk=lang_id) if lang_id else None
        instance.save()

        return instance


#read serializers

class StudentSerializer(serializers.ModelSerializer):
    person            = PersonSerializer(read_only=True)
    parent_name       = serializers.SerializerMethodField()
    parent_id         = serializers.IntegerField(source='parent.person_id', read_only=True, allow_null=True)
    parent_phone      = serializers.SerializerMethodField()
    parent_relationship = serializers.SerializerMethodField()
    class_name        = serializers.SerializerMethodField()
    username          = serializers.SerializerMethodField()

    class Meta:
        model  = Student
        fields = [
            'person', 'date_of_birth', 'special_case',
            'parent_id', 'parent_name', 'parent_phone', 'parent_relationship',
            'class_name', 'username',
        ]

    def get_parent_name(self, obj):
        if obj.parent and obj.parent.person:
            return f"{obj.parent.person.first_name} {obj.parent.person.last_name}"
        return None

    def get_parent_phone(self, obj):
        if obj.parent and obj.parent.person:
            return obj.parent.person.phone
        return None

    def get_parent_relationship(self, obj):
        if obj.parent:
            return obj.parent.relationship
        return None

    def get_class_name(self, obj):
      from apps.inscription.models import Inscription
      inscription = Inscription.objects.filter(
        student=obj,
        status='confirmed'
       ).select_related('enrolled_class').first()
      if inscription:
        return inscription.enrolled_class.name
      return None

    def get_username(self, obj):
        from apps.accounts.models import Account
        account = Account.objects.filter(student=obj).first()
        if account:
            return account.username
        return None
    

class ParentSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)

    class Meta:
        model = Parent
        fields = ['person', 'relationship']


class EmployeeSerializer(serializers.ModelSerializer):
    person   = PersonSerializer(read_only=True)
    position = PositionSerializer(read_only=True)
    account  = serializers.SerializerMethodField()

    def get_account(self, obj):
     from apps.accounts.models import Account
     print(f"Looking for account with employee_id={obj.person_id}")
     acc = Account.objects.filter(employee=obj).first()
     print(f"Found: {acc}")
     if acc:
        return {"username": acc.username, "role": acc.role.name}
     return None

    class Meta:
        model = Employee
        fields = ['person_id', 'person', 'position', 'hire_date', 'end_date', 'status' ,'account']


class TeacherSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    language = LanguageSerializer(read_only=True)
    account  = serializers.SerializerMethodField()

    def get_account(self, obj):
     from apps.accounts.models import Account
     print(f"Teacher employee: {obj.employee}")
     print(f"Teacher employee pk: {obj.employee.pk}")
     acc = Account.objects.filter(employee=obj.employee).first()
     print(f"Account found: {acc}")
     return {"username": acc.username, "role": acc.role.name} if acc else None

    class Meta:
        model = Teacher
        fields = ['employee', 'qualifications', 'language', 'is_head_teacher', 'account']

class EmployeeWithoutTeacherListView(generics.ListAPIView):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        return Employee.objects.filter(
            teacher__isnull=True  # reverse relation from Teacher → Employee
        ).select_related('person', 'position')  # matches your EmployeeSerializer fields