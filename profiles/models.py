from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
import os,uuid

User = settings.AUTH_USER_MODEL

def logo_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    new_filename = f"{uuid.uuid4()}{ext}"
    return os.path.join('company_logo', new_filename)

class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="recruiter_profile")
    company_name = models.CharField(max_length=255, blank=True)
    industry = models.TextField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    company_website = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    linkedin_url = models.URLField(blank=True)
    about = models.TextField(blank=True)
    company_logo = models.ImageField(upload_to=logo_upload_path, blank=True, null=True)

    def __str__(self):
        return f"RecruiterProfile<{self.user}>"

def resume_upload_path(instance, filename):
    return f"resume/user_{instance.user.id}/{filename}"

###########################################################

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

############################################################

class FreelancerProfile(models.Model):

    EXPERIENCE_CHOICES = [
        ("fresher", "Fresher"),
        ("junior", "Junior (1-2 years)"),
        ("mid", "Mid-level (3-5 years)"),
        ("senior", "Senior (5+ years)"),
        ("expert", "Expert (10+ years)"),
    ]
    AVAILABILITY_CHOICES = [
        ("immediate", "Immediate"),
        ("oneweek", "1 Week"),
        ("twoweek", "2 Weeks"),
        ("amonth", "1 Month"),
        ("openToOffers", "Open to offers"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="freelancer_profile")
    name = models.TextField(blank=True)
    dob = models.DateField(blank=True, null=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15,blank=True)
    location = models.TextField(blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    education = models.TextField(blank=True)
    experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, blank=True) 
    skills = models.ManyToManyField(Skill, related_name="freelancers", blank=True)     
    portfolio_url = models.URLField(blank=True)
    resume = models.FileField(upload_to=resume_upload_path, blank=True, null=True)
    expected_salary = models.FloatField(blank=True, default=0.0)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, blank=True)

    def __str__(self):
        return f"FreelancerProfile<{self.user}>"

UserModel = get_user_model()

@receiver(post_save, sender=UserModel)
def create_profile_for_role(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.role == "recruiter":
        RecruiterProfile.objects.create(user=instance)
    elif instance.role == "freelancer":
        FreelancerProfile.objects.create(user=instance)
