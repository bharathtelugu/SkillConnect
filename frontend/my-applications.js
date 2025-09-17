const access = localStorage.getItem("access");
const role = localStorage.getItem("role");

if (!access || role !== "freelancer") {
  window.location.href = "auth.html";
}

const statusFilter = document.getElementById("filter-status");
const sortFilter = document.getElementById("sort-by");

statusFilter.addEventListener('change', () => loadApplications());
sortFilter.addEventListener('change', () => loadApplications());


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

  return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold ${colorClasses}">
    ${label}
  </span>`;
}

async function loadApplications() {
  const appsList = document.getElementById("applicationsList");
  appsList.innerHTML = `<p class="text-gray-600 col-span-full text-center">Loading applications...</p>`;

  const status = statusFilter.value;
  const ordering = sortFilter.value;

  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }
  if (ordering) {
    params.append('ordering', ordering);
  }

  try {
    const res = await fetch(`${API}/jobs/application/my/?${params.toString()}`, {
      headers: { Authorization: "Bearer " + access },
    });

    if (!res.ok) throw new Error("Failed to load applications ❌");

    const apps = await res.json();

    if (apps.length === 0) {
      appsList.innerHTML = `<p class="text-gray-600 col-span-full text-center">You haven't applied for any jobs matching these filters.</p>`;
      return;
    }

    appsList.innerHTML = apps
      .map(
        (app) => `
        <div class="border p-5 rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg animate-fade-in">
          <div class="flex justify-between items-start">
            <div>
              <a href="job-detail.html?id=${app.job_id}" class="text-lg font-bold text-gray-800 hover:text-blue-600 hover:underline">
                ${app.job_title}
              </a>
              <p class="text-gray-600 text-sm">Recruiter: ${app.recruiter_company}</p>
            </div>
            ${renderStatusBadge(app.status)}
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-sm text-gray-500">
              Applied on: ${new Date(app.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    showNotification(err.message, "error");
    appsList.innerHTML = `<p class="text-red-500 col-span-full text-center">An error occurred while loading your applications.</p>`;
  }
}

loadApplications();