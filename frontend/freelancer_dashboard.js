document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Authentication and Initial Setup ---
  const { access, role } = getAuth();
  if (!access || role !== "freelancer") {
    window.location.href = "auth.html";
    return;
  }
  renderNavbar();

  document.getElementById("today-date").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  // --- 2. Main Data Fetching ---
  async function loadDashboardData() {
    const headers = { Authorization: `Bearer ${access}` };
    try {
      const [profileRes, appsRes] = await Promise.all([
        fetch(`${API}/profiles/profile/freelancer/me/`, { headers }),
        fetch(`${API}/jobs/application/my/`, { headers }),
      ]);

      if (!profileRes.ok || !appsRes.ok) throw new Error("Failed to load dashboard data.");

      const profile = await profileRes.json();
      const applications = await appsRes.json();
      
      // --- 3. Populate Dashboard Sections ---
      populateWelcomeMessage(profile);
      populateStats(applications);
      calculateAndDisplayProfileScore(profile);
      populateRecentApplications(applications);
      renderApplicationStatusChart(applications);
      
    } catch (error) {
      console.error("Dashboard Error:", error);
      showNotification(error.message, "error");
    }
  }

  // --- 4. UI Population Functions ---
  function populateWelcomeMessage(profile) {
    const welcomeMsg = document.getElementById('welcome-message');
    const name = profile.name || 'Freelancer';
    welcomeMsg.innerHTML = `Welcome back, <span class="text-blue-600">${name}</span>! 👋`;
  }

  function animateNumber(element, target) {
    let current = 0;
    const increment = target / 100 || 1;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(interval);
      } else {
        element.textContent = Math.ceil(current);
      }
    }, 20);
  }

  function populateStats(applications) {
    const total = applications.length;
    const pending = applications.filter(app => ['applied', 'reviewed'].includes(app.status)).length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    animateNumber(document.getElementById("total-applied"), total);
    animateNumber(document.getElementById("pending-apps"), pending);
    animateNumber(document.getElementById("accepted-apps"), accepted);
    animateNumber(document.getElementById("rejected-apps"), rejected);
  }

  function calculateAndDisplayProfileScore(profile) {
      const fields = [
          'name', 'dob', 'phone', 'location', 'education', 
          'experience', 'portfolio_url', 'github_url', 'resume'
      ];
      const filledFields = fields.filter(field => profile[field]).length;
      const skillsCompleted = profile.skills && profile.skills.length > 0;
      
      let totalPoints = filledFields + (skillsCompleted ? 1 : 0);
      const maxPoints = fields.length + 1;
      
      const score = Math.round((totalPoints / maxPoints) * 100);

      const scoreEl = document.getElementById('profile-score');
      const progressEl = document.getElementById('profile-progress');
      const tipEl = document.getElementById('profile-tip');

      animateNumber(scoreEl, score);
      setTimeout(() => {
          progressEl.style.width = `${score}%`;
      }, 100);

      if (score < 75) {
          tipEl.textContent = "Your profile is incomplete! Add more details to attract recruiters.";
      } else {
          tipEl.textContent = "Great job! Your profile is strong and ready for applications.";
          tipEl.classList.add('text-green-600');
      }
  }

  function populateRecentApplications(applications) {
    const tableBody = document.getElementById("recent-apps-body");
    const recentApps = [...applications]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    if (recentApps.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-gray-500">No applications yet.</td></tr>`;
      return;
    }
    tableBody.innerHTML = recentApps.map(app => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          <a href="job-detail.html?id=${app.job_id}" class="hover:text-blue-600">${app.job_title}</a>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${app.recruiter_company}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">${renderStatusBadge(app.status)}</td>
      </tr>`
    ).join("");
  }
  
  // --- 5. Chart Rendering Functions ---
  function renderApplicationStatusChart(applications) {
    const ctx = document.getElementById("pieChart")?.getContext("2d");
    if (!ctx) return;

    const statusCounts = applications.reduce((acc, app) => {
      const status = app.status.charAt(0).toUpperCase() + app.status.slice(1);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ["#FBBF24", "#3B82F6", "#10B981", "#EF4444", "#6B7280"],
          borderColor: '#fff',
          borderWidth: 3,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, legend: { position: 'bottom' } },
    });
  }

  // --- 6. Utility Functions ---
  function renderStatusBadge(status) {
    let colorClasses = "";
    let label = status.charAt(0).toUpperCase() + status.slice(1);
    switch (status) {
      case "applied": colorClasses = "bg-blue-100 text-blue-800"; break;
      case "reviewed": colorClasses = "bg-yellow-100 text-yellow-800"; break;
      case "accepted": colorClasses = "bg-green-100 text-green-800"; break;
      case "rejected": colorClasses = "bg-red-100 text-red-800"; break;
      default: colorClasses = "bg-gray-100 text-gray-800";
    }
    return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}">${label}</span>`;
  }

  // --- Initial Call ---
  loadDashboardData();
});