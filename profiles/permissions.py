from rest_framework.permissions import BasePermission

class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "recruiter")

class IsFreelancer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "freelancer")
