document.addEventListener("DOMContentLoaded", () => {
  const access = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  if (!access || role !== "recruiter") {
    window.location.href = "auth.html";
    return;
  }

  // --- NEW: Detect Edit Mode and Job ID from URL ---
  const form = document.getElementById("postJobForm");
  const urlParams = new URLSearchParams(window.location.search);
  const jobIdToEdit = urlParams.get('edit');
  const isEditMode = !!jobIdToEdit; // Converts to true if jobIdToEdit is not null

  const workModeSelect = document.getElementById('work_mode');
  const locationDiv = document.getElementById('location_div');
  
  // --- Main Initialization Logic ---
  async function initializePage() {
    if (isEditMode) {
      // Update UI for editing
      document.title = 'Edit Job • Skill Connect';
      document.querySelector('h2').textContent = 'Edit Job';
      document.querySelector('button[type="submit"]').textContent = 'Update Job';
      
      // Fetch the specific job's data and populate the form
      await loadJobDataForEditing(jobIdToEdit);
    } else {
      // Just load empty skill options for a new job
      await loadSkillsOptions();
    }
  }

  // --- NEW: Function to fetch job data and pre-fill the form ---
  async function loadJobDataForEditing(jobId) {
    try {
      const res = await fetch(`${API}/jobs/job/${jobId}/`, {
        headers: { Authorization: "Bearer " + access }
      });

      if (!res.ok) throw new Error('Failed to fetch job details for editing.');
      
      const job = await res.json();

      // Pre-fill form fields
      form.title.value = job.title;
      form.pay_per_hour.value = job.pay_per_hour;
      form.requirements.value = job.requirements;
      form.key_responsibilities.value = job.key_responsibilities;
      form.work_mode.value = job.work_mode;
      
      // Trigger change event to show/hide location field
      workModeSelect.dispatchEvent(new Event('change')); 
      if (job.location) {
        form.location.value = job.location;
      }
      
      // Extract the IDs of the skills already associated with the job
      const selectedSkillIds = job.skills.map(skill => skill.id.toString());
      
      // Load all skill options, ensuring the correct ones are pre-selected
      await loadSkillsOptions(selectedSkillIds);

    } catch (err) {
      showNotification(err.message, "error");
      // Redirect if the job can't be loaded
      setTimeout(() => window.location.href = 'my-jobs.html', 1500);
    }
  }

  // --- MODIFIED: loadSkillsOptions now accepts pre-selected IDs ---
  async function loadSkillsOptions(selectedIds = []) {
    try {
      const res = await fetch(`${API}/profiles/skills/`, {
        headers: { Authorization: "Bearer " + access },
      });
      if (!res.ok) throw new Error("Failed to load skills");
      
      const skills = await res.json();
      const menu = document.getElementById("skills-menu");
      const label = document.getElementById("skills-label");
      const hiddenInput = document.getElementById("skills-hidden");

      menu.innerHTML = "";
      
      skills.forEach((skill) => {
        const isChecked = selectedIds.includes(skill.id.toString());
        const option = document.createElement("label");
        option.className = "flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer";
        option.innerHTML = `
          <input type="checkbox" value="${skill.id}" class="form-checkbox h-4 w-4 text-blue-600 mr-2" ${isChecked ? 'checked' : ''}>
          <span>${skill.name}</span>
        `;
        menu.appendChild(option);
      });

      function updateSelection() {
        const checked = Array.from(menu.querySelectorAll("input:checked")).map((cb) => ({
          id: cb.value, name: cb.nextElementSibling.textContent,
        }));
        label.textContent = checked.length > 0 ? checked.map((c) => c.name).join(", ") : "Select skills";
        hiddenInput.value = checked.map((c) => c.id).join(",");
      }

      menu.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", updateSelection);
      });

      updateSelection(); // Initial call to set label and hidden input correctly

    } catch (err) {
      console.error(err);
    }
  }

  // --- Event Listeners ---
  workModeSelect.addEventListener('change', function () {
    const selectedValue = this.value.toLowerCase();
    locationDiv.style.display = (selectedValue === 'inoffice' || selectedValue === 'hybrid') ? 'block' : 'none';
  });

  const toggle = document.getElementById("skills-toggle");
  const menu = document.getElementById("skills-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => menu.classList.toggle("hidden"));
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }

  // --- MODIFIED: Form submission handles both CREATE (POST) and EDIT (PATCH) ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    // API endpoint and method depend on whether we are in edit mode
    const url = isEditMode 
      ? `${API}/jobs/job/${jobIdToEdit}/edit/` 
      : `${API}/jobs/job/create/`;
    const method = isEditMode ? 'PATCH' : 'POST';
    
    // Handle skills separately for FormData
    const selectedSkills = document.getElementById("skills-hidden").value;
    const skillIds = selectedSkills ? selectedSkills.split(",") : [];
    
    formData.delete('skills'); 
    skillIds.forEach(id => formData.append('skills_ids', id));
  
    try {
      const res = await fetch(url, {
        method: method,
        headers: { Authorization: "Bearer " + access },
        body: formData, 
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Failed to ${isEditMode ? 'update' : 'post'} job ❌ ${JSON.stringify(err)}`);
      }
      
      showNotification(`Job ${isEditMode ? 'updated' : 'posted'} successfully ✅`, "success");

      // MODIFIED: Redirect logic without parsing the JSON response
      setTimeout(() => {
        window.location.href = `job-detail.html?id=${jobIdToEdit}`;
      }, 1000);
    } catch (err) {
      showNotification(err.message, "error");
    }
  });

  document.getElementById("logout").addEventListener("click", () => logout());

  // --- Start the page logic ---
  initializePage();
});