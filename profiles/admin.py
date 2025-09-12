from django.contrib import admin
from .models import RecruiterProfile, FreelancerProfile

@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "company_name")
    search_fields = ("user__email", "company_name")

@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user")
    search_fields = ("user__email","skills")