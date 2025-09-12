from rest_framework import serializers
from .models import RecruiterProfile, FreelancerProfile, Skill

class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ["company_name", "company_website", "location", "about"]

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


    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = FreelancerProfile
        fields = ["name","dob","education", "experience", "experience_display", "skills", "skill_ids", "portfolio_url","resume", "resume_url"]
    
    def get_resume_url(self,obj):
        request = self.context.get("request")
        if obj.resume and request:
            return request.build_absolute_uri(obj.resume.url)
        return None
