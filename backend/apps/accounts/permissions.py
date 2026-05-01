from rest_framework.permissions import BasePermission


class _RolePermission(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.role.name in self.allowed_roles


class IsAdmin(_RolePermission):
    allowed_roles = ('admin',)


class IsTeacher(_RolePermission):
    allowed_roles = ('teacher',)


class IsStudent(_RolePermission):
    allowed_roles = ('student',)


class IsAdminOrSuperAdmin(_RolePermission):
    allowed_roles = ('admin', 'superadmin')


class IsNotStudent(_RolePermission):
    allowed_roles = ('admin', 'teacher', 'superadmin')
    def has_permission(self, request, view):
        print("USER:", request.user)
        print("ROLE:", request.user.role)
        print("ROLE NAME:", request.user.role.name)
        print("ALLOWED:", self.allowed_roles)
        return super().has_permission(request, view)
