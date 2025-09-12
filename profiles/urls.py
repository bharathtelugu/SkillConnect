from django.urls import path
from .views import MeRecruiterProfileView, MeFreelancerProfileView, SkillListView

urlpatterns = [
    path("profile/recruiter/me/", MeRecruiterProfileView.as_view(), name="recruiter_profile_me"),
    path("profile/freelancer/me/", MeFreelancerProfileView.as_view(), name="freelancer_profile_me"),
    path("skills/", SkillListView.as_view(), name="skills"),
]
