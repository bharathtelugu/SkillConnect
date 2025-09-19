from rest_framework import serializers
from .models import RecruiterProfile, FreelancerProfile, Skill, Notification


class RecruiterProfileSerializer(serializers.ModelSerializer):

    company_logo = serializers.ImageField(read_only=True) 
    company_logo_upload = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = RecruiterProfile
        fields = [
            "company_name", "company_website", "location", "about", 
            "industry", "email", "phone", "linkedin_url", 
            "company_logo", "company_logo_upload"
        ]

    def update(self, instance, validated_data):
        new_logo = validated_data.pop('company_logo_upload', None)
        if new_logo:
            instance.company_logo = new_logo
        return super().update(instance, validated_data)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class FreelancerProfileSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, write_only=True, source="skills"
    )
    experience_display = serializers.CharField(source="get_experience_display", read_only=True)
    availability_display = serializers.CharField(source="get_availability_display", read_only=True)
    
    resume = serializers.FileField(read_only=True) 
    profilepic = serializers.ImageField(read_only=True)

    resume_upload = serializers.FileField(write_only=True, required=False)
    profilepic_upload = serializers.ImageField(write_only=True, required=False)
    
    profilepic_url = serializers.SerializerMethodField()


    class Meta:
        model = FreelancerProfile
        fields = [
            "name","dob","education", "experience", "experience_display", 
            "skills", "skill_ids", "portfolio_url", "resume", "resume_upload",
            "email", "phone", "location", "github_url", "linkedin_url", 
            "expected_salary", "availability", "availability_display",
            "profilepic", "profilepic_upload", "profilepic_url"
        ]
    
    def get_profilepic_url(self,obj):
        request = self.context.get("request")

        if obj.profilepic and request:
            return request.build_absolute_uri(obj.profilepic.url)
        return None
        
    def update(self, instance, validated_data):
        new_resume = validated_data.pop('resume_upload', None)
        if new_resume:
            instance.resume = new_resume
        
        new_profilepic = validated_data.pop('profilepic_upload', None)
        if new_profilepic:
            instance.profilepic = new_profilepic
        
        return super().update(instance, validated_data)
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message", "is_read", "created_at"]