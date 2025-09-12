from rest_framework import generics, permissions
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer
from profiles.permissions import IsRecruiter, IsFreelancer
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics

# Recruiter can create jobs
class JobCreateView(generics.CreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(recruiter=self.request.user)

# Recruiter can see their own jobs
class MyJobsView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user)

# Freelancers can browse all jobs
class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def get_queryset(self):
        # print("--- New Request ---")
        # print("Query Params Received:", self.request.query_params)
        qs = Job.objects.all().order_by("-created_at")
        # print("Initial queryset count:", qs.count())

        skills = self.request.query_params.getlist("skills")  # multiple IDs
        min_pay = self.request.query_params.get("min_pay")
        max_pay = self.request.query_params.get("max_pay")
        location = self.request.query_params.get("location")
        experience = self.request.query_params.get("experience")

        if skills:
            qs = qs.filter(skills__id__in=skills).distinct()
        if min_pay:
            qs = qs.filter(pay_per_hour__gte=min_pay)
        if max_pay:
            qs = qs.filter(pay_per_hour__lte=max_pay)
        if location:
            qs = qs.filter(location=location)
        if experience:
            qs = qs.filter(requirements__icontains=experience)  # later you can make this structured

        # print("Final queryset count:", qs.count())
        return qs

# Both can retrieve details
class JobDetailView(generics.RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

# Freelancer applies to a job
class ApplyJobView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def perform_create(self, serializer):
        job_id = self.request.data.get("job")
        freelancer_profile = self.request.user.freelancer_profile

        application = serializer.save(
            freelancer=self.request.user,
            job_id = job_id,
        )
        if freelancer_profile.resume:
            application.resume = freelancer_profile.resume
            application.save()

# Freelancer views their own applications
class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def get_queryset(self):
        return Application.objects.filter(freelancer=self.request.user)

# Recruiter views applications for their jobs
class ApplicationsForMyJobsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Application.objects.filter(job__recruiter=self.request.user).select_related("job", "freelancer")


# Recruiter can delete their own job
class JobDeleteView(generics.DestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        # Only allow recruiters to delete jobs they own
        return Job.objects.filter(recruiter=self.request.user)

#recruiter can manage the applications for their own job

class ApplicationStatusUpdateView(generics.UpdateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        # Only recruiters can update applications for *their own jobs*
        return Application.objects.filter(job__recruiter=self.request.user)