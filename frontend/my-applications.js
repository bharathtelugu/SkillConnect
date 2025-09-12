const access = localStorage.getItem("access");
const role = localStorage.getItem("role");

if (!access || role !== "freelancer") {
  window.location.href = "auth.html";
}

function renderStatusBadge(status) {
  let colorClasses = "";
  let label = status.charAt(0).toUpperCase() + status.slice(1);

  switch (status) {
    case "applied":
      colorClasses = "bg-blue-100 text-blue-800";
      break;
    case "reviewed":
      colorClasses = "bg-yellow-100 text-yellow-800";
      break;
    case "accepted":
      colorClasses = "bg-green-100 text-green-800";
      break;
    case "rejected":
      colorClasses = "bg-red-100 text-red-800";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-800";
  }

  return `<span class="px-2 py-1 rounded-full text-sm font-semibold ${colorClasses}">
    ${label}
  </span>`;
}

async function loadApplications() {
  try {
    const res = await fetch(`${API}/jobs/application/my/`, {
      headers: { Authorization: "Bearer " + access },
    });

    if (!res.ok) throw new Error("Failed to load applications ❌");

    const apps = await res.json();
    const appsList = document.getElementById("applicationsList");

    if (apps.length == 0) {
      appsList.innerHTML = `<p class="text-gray-600">You haven't applied for any jobs yet.</p>`;
      return;
    }

    appsList.innerHTML = apps
      .map(
        (app) => `
      <div class="border p-5 rounded-xl bg-white shadow-sm">
        <p class="text-lg font-semibold text-gray-800"><b>Job:</b> ${
          app.job_title
        }</p>
        <p class="text-gray-700"><b>Recruiter:</b> ${app.recruiter_company}</p>
        <p class="text-gray-700"><b>Status:</b> ${renderStatusBadge(
          app.status
        )}</p>
        <p class="text-sm text-gray-500"><i>Applied at: ${new Date(
          app.created_at
        ).toLocaleString()}</i></p>
      </div>`
      )
      .join("");
  } catch (err) {
    showNotification(err.message, "error");
  }
}

loadApplications();

document.getElementById("logout").addEventListener("click", () => {
  logout();
});
