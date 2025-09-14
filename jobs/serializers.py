from rest_framework import serializers
from .models import Job, Application
from profiles.serializers import SkillSerializer
from profiles.models import Skill

class JobSerializer(serializers.ModelSerializer):
    recruiter_email = serializers.ReadOnlyField(source="recruiter.email")
    skills = SkillSerializer(many=True, read_only=True)
    skills_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        source="skills"
    )
    already_applied = serializers.SerializerMethodField()

    def get_already_applied(self, obj):
        user = self.context["request"].user
        if user.is_authenticated and hasattr(user, "freelancer_profile"):
            return obj.applications.filter(freelancer=user).exists()
        return False
    
    work_mode_display = serializers.CharField(source="get_work_mode_display", read_only=True)

    picture_url = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ["id", "title", "pay_per_hour", "skills", "skills_ids", "requirements", "recruiter_email", "work_mode", "work_mode_display", "location", "created_at", "already_applied","picture", "picture_url", "key_responsibilities"]

    def get_picture_url(self,obj):
        request = self.context.get("request")
        if obj.picture and request:
            return request.build_absolute_uri(obj.picture.url)
        return None


class ApplicationSerializer(serializers.ModelSerializer):
    freelancer_email = serializers.ReadOnlyField(source="freelancer.email")
    freelancer_name = serializers.SerializerMethodField()
    job_title = serializers.ReadOnlyField(source="job.title")
    recruiter_company = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "job_title",
            "recruiter_company",
            "freelancer_email",
            "freelancer_name",
            "resume",
            "status",
            "created_at",
        ]
        read_only_fields = ["resume", "created_at"]

    def get_freelancer_name(self, obj):
        user = obj.freelancer
        profile = getattr(user, "freelancer_profile", None)
        if profile and getattr(profile, "name", None):
            return profile.name
        try:
            full = user.get_full_name()
            if full:
                return full
        except Exception:
            pass
        return getattr(user, "email", "Unknown")
    
    def get_recruiter_company(self, obj):
        recruiter_profile = getattr(obj.job.recruiter, "recruiter_profile", None)
        if recruiter_profile and recruiter_profile.company_name:
            return recruiter_profile.company_name
        return obj.job.recruiter.email  # fallback
