const access = localStorage.getItem("access");
const role = localStorage.getItem("role");

if (!access || role !== "freelancer") {
  window.location.href = "auth.html";
}

// --- render jobs ---
async function loadJobs(filters = new URLSearchParams()) {
  try {
    // build query string
    const params = filters.toString();
    console.log("Requesting URL:", `${API}/jobs/job/?${params}`);
    // console.log(params);
    const res = await fetch(`${API}/jobs/job/?${params}`, {
      headers: { Authorization: "Bearer " + access },
    });

    if (!res.ok) throw new Error("Failed to load jobs ❌");

    const jobs = await res.json();
    const jobsList = document.getElementById("jobsList");

    if (jobs.length === 0) {
      jobsList.innerHTML = `<p class="text-gray-600">No jobs found with these filters.</p>`;
      return;
    }

    jobsList.innerHTML = jobs
      .map(
        (job) => `
        <div class="border p-5 rounded-xl bg-white shadow-sm flex items-center gap-5">
  <div class="w-24 h-24 flex-shrink-0">
    ${
      job.picture
        ? `<img src="${job.picture}" alt="${job.title} photo" class="w-full h-full rounded-lg object-cover">`
        : `<div class="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375M9 12h6.375m-6.375 5.25h6.375M5.25 9h13.5" />
            </svg>
           </div>`
    }
  </div>

  <div class="flex-grow min-w-0">
    <h3 class="text-xl font-semibold text-gray-800">${job.title}</h3>
    <p class="text-gray-700 mt-1"><b>Location:</b> ${job.location_display}</p>
    <p class="text-gray-700"><b>Pay:</b> $${job.pay_per_hour}/hr</p>
    <p class="text-gray-700">
      <b>Skills:</b> ${
        job.skills && job.skills.length > 0
          ? job.skills.map((s) => s.name).join(", ")
          : "N/A"
      }
    </p>
    
    <div class="mt-2 flex justify-between items-center">
        <p class="text-gray-600 text-sm truncate max-w-xs">
        <b>Requirements:</b>
            ${job.requirements}
        </p>
        <div>
        ${
          job.already_applied
            ? `<span class="px-3 py-1 rounded bg-gray-200 text-gray-600 text-sm">Applied</span>`
            : `<button class="apply-btn bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm flex-shrink-0" onclick="applyJob(${job.id})">I'm Interested</button>`
        }
      </div>
    </div>
  </div>
</div>`
      )
      .join("");
  } catch (err) {
    showNotification(err.message, "error");
  }
}

// --- apply to a job ---
async function applyJob(jobId) {
  try {
    const res = await fetch(`${API}/jobs/application/apply/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + access,
      },
      body: JSON.stringify({ job: jobId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error("Failed to apply ❌ " + JSON.stringify(err));
    }

    showNotification("Application submitted ✅", "success");
    // reload so job shows as Applied
    loadJobs();
  } catch (err) {
    showNotification(err.message, "error");
  }
}

// --- handle filters (CORRECTED) ---
document.getElementById("applyFilters").addEventListener("click", () => {
  // Use URLSearchParams for robust query string creation
  const params = new URLSearchParams();

  const minPay = document.getElementById("minPay").value;
  const maxPay = document.getElementById("maxPay").value;
  const location = document.getElementById("location").value;
  const skillsHidden = document.getElementById("skills-hidden").value;

  // Append each filter to the params object if it has a value
  if (minPay) params.append("min_pay", minPay);
  if (maxPay) params.append("max_pay", maxPay);
  if (location) params.append("location", location);

  // Correctly handle the many-to-many skills filter
  if (skillsHidden) {
    skillsHidden.split(",").forEach((id) => {
      params.append("skills", id); // Append each skill ID separately
    });
  }

  // Pass the final URLSearchParams object to the loadJobs function
  loadJobs(params);
});

// --- clear filters ---
document.getElementById("clearFilters").addEventListener("click", (e) => {
  // e.preventDefault();
  // reset inputs
  document.getElementById("minPay").value = "";
  document.getElementById("maxPay").value = "";
  document.getElementById("location").value = "";

  const skillsSelect = document.getElementById("skills-hidden");
  if (skillsSelect) {
    Array.from(skillsSelect.options).forEach((opt) => (opt.selected = false));
  }
  // reload jobs without filters
  loadJobs();
});

// --- init ---
loadJobs();

document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "auth.html";
});

// jobs.js

// Function to fetch and populate the skills dropdown
async function loadSkillsOptions() {
  try {
    // Make sure you have the 'access' token defined
    const res = await fetch(`${API}/profiles/skills/`, {
      // Make sure this URL is correct
      headers: { Authorization: "Bearer " + access },
    });

    if (!res.ok) throw new Error("Failed to load skills");

    const skills = await res.json();
    const menu = document.getElementById("skills-menu");
    const label = document.getElementById("skills-label");
    const hiddenInput = document.getElementById("skills-hidden");

    // Clear previous options
    menu.innerHTML = "";

    // Create a checkbox for each skill
    skills.forEach((skill) => {
      const option = document.createElement("label");
      option.className =
        "flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer";
      option.innerHTML = `
        <input type="checkbox" value="${skill.id}" class="form-checkbox h-4 w-4 text-blue-600 mr-2">
        <span>${skill.name}</span>
      `;
      menu.appendChild(option);
    });

    // Function to update the selection text and hidden input
    function updateSelection() {
      const checked = Array.from(menu.querySelectorAll("input:checked")).map(
        (cb) => ({
          id: cb.value,
          name: cb.nextElementSibling.textContent,
        })
      );

      // Update the button text
      label.textContent =
        checked.length > 0
          ? checked.map((c) => c.name).join(", ")
          : "Any Skill";

      // Update the hidden input with comma-separated IDs
      hiddenInput.value = checked.map((c) => c.id).join(",");
    }

    // Add event listeners to all new checkboxes
    menu.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.addEventListener("change", updateSelection);
    });
  } catch (err) {
    console.error(err);
  }
}

// Logic to toggle the dropdown's visibility
document.addEventListener("DOMContentLoaded", () => {
  // Call the function to populate the dropdown when the page loads
  loadSkillsOptions();

  const toggle = document.getElementById("skills-toggle");
  const menu = document.getElementById("skills-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => menu.classList.toggle("hidden"));

    // Hide dropdown if clicking outside of it
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }
});