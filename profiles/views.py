from rest_framework import generics, permissions
from .models import RecruiterProfile, FreelancerProfile, Skill
from .serializers import RecruiterProfileSerializer, FreelancerProfileSerializer, SkillSerializer
from .permissions import IsRecruiter, IsFreelancer
from rest_framework.parsers import MultiPartParser, FormParser

class MeRecruiterProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_object(self):
        return self.request.user.recruiter_profile

class SkillListView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]  # public endpoint

class MeFreelancerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = FreelancerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.freelancer_profile
