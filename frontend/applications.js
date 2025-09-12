const access = localStorage.getItem("access");
const role = localStorage.getItem("role");

if (!access || role !== "recruiter") {
  window.location.href = "auth.html";
}

// Render status badge
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

  return `<span class="status-label px-2 py-1 rounded-full text-sm font-semibold ${colorClasses}">
    ${label}
  </span>`;
}

// Render action buttons (none if accepted/rejected)
function renderActionButtons(status) {
  if (status === "accepted" || status === "rejected") {
    return "";
  }
  return `
    <div class="mt-4 space-x-2 buttons-container">
      ${
        status !== "reviewed"
          ? `
        <button class="status-btn bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" data-status="reviewed">Mark Reviewed</button>
      `
          : ""
      }
      <button class="status-btn bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" data-status="accepted">Accept</button>
      <button class="status-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" data-status="rejected">Reject</button>
    </div>
  `;
}

async function loadApplications() {
  try {
    const res = await fetch(`${API}/jobs/application/recruiter/`, {
      headers: { Authorization: "Bearer " + access },
    });

    if (!res.ok) throw new Error("Failed to load applications ❌");

    const apps = await res.json();
    const appsList = document.getElementById("applicationsList");

    if (apps.length === 0) {
      appsList.innerHTML = `<p class="text-gray-600">No applications yet.</p>`;
      return;
    }

    appsList.innerHTML = apps
      .map((app) => {
        const name = app.freelancer_name || app.freelancer_email || "Unknown";
        return `
        <div class="application-card border p-5 rounded-xl bg-white shadow-sm animate-fade-in" data-id="${
          app.id
        }">
          <h3 class="text-lg font-semibold text-gray-800">${name}</h3>
          <p class="text-gray-600"><b>Email:</b> ${app.freelancer_email}</p>
          <p class="text-gray-600"><b>Applied for:</b> ${app.job_title}</p>
          
          <p class="text-gray-600">
            <b>Resume:</b>
            ${
              app.resume
                ? `<a href="${app.resume}" target="_blank" class="text-blue-600 hover:underline">Download Resume</a>`
                : "N/A"
            }
          </p>

          <p class="text-gray-600"><b>Status:</b> ${renderStatusBadge(
            app.status
          )}</p>
          <p class="text-sm text-gray-500"><i>Applied on: ${new Date(
            app.created_at
          ).toLocaleString()}</i></p>

          ${renderActionButtons(app.status)}
        </div>
      `;
      })
      .join("");
  } catch (err) {
    showNotification(err.message, "error");
  }
}

// Handle status updates
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("status-btn")) {
    const card = e.target.closest(".application-card");
    const appId = card.dataset.id;
    const newStatus = e.target.dataset.status;

    try {
      const res = await fetch(`${API}/jobs/application/${appId}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error("Failed to update status ❌ " + JSON.stringify(err));
      }

      const updated = await res.json();

      // Update badge
      card.querySelector(".status-label").outerHTML = renderStatusBadge(
        updated.status
      );

      // Update buttons
      const buttonsContainer = card.querySelector(".buttons-container");
      if (buttonsContainer) {
        buttonsContainer.outerHTML = renderActionButtons(updated.status);
      }

      showNotification(`Application marked as ${updated.status} ✅`, "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  }
});

loadApplications();

document.getElementById("logout").addEventListener("click", () => {
  logout();
});
