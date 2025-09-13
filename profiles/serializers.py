from rest_framework import serializers
from .models import RecruiterProfile, FreelancerProfile, Skill

class RecruiterProfileSerializer(serializers.ModelSerializer):

    company_logo_url = serializers.SerializerMethodField()


    class Meta:
        model = RecruiterProfile
        fields = ["company_name", "company_website", "location", "about", "industry", "email", "phone", "linkedin_url","company_logo", "company_logo_url"]

    def get_company_logo_url(self,obj):
        request = self.context.get("request")
        if obj.company_logo and request:
            return request.build_absolute_uri(obj.company_logo.url)
        return None

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]

class FreelancerProfileSerializer(serializers.ModelSerializer):

    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        source="skills"
    )

    experience_display = serializers.CharField(source="get_experience_display", read_only=True)

    availability_display = serializers.CharField(source="get_availability_display", read_only=True)

    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = FreelancerProfile
        fields = ["name","dob","education", "experience", "experience_display", "skills", "skill_ids", "portfolio_url","resume", "resume_url",
                  "email", "phone", "location", "github_url", "linkedin_url", "expected_salary", "availability", "availability_display"]
    
    def get_resume_url(self,obj):
        request = self.context.get("request")
        if obj.resume and request:
            return request.build_absolute_uri(obj.resume.url)
        return None
