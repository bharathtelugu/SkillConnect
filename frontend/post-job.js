const access = localStorage.getItem("access");
const role = localStorage.getItem("role");

if (!access || role !== "recruiter") {
  window.location.href = "auth.html";
}

const workModeSelect = document.getElementById('work_mode');
const locationDiv = document.getElementById('location_div');

workModeSelect.addEventListener('change', function () {
  const selectedValue = this.value.toLowerCase();
  if (selectedValue === 'inoffice' || selectedValue === 'hybrid') {
    locationDiv.style.display = 'block';
  } else {
    locationDiv.style.display = 'none';
  }
});

// Function to fetch and populate the skills dropdown
async function loadSkillsOptions() {
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
      const option = document.createElement("label");
      option.className = "flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer";
      option.innerHTML = `
        <input type="checkbox" value="${skill.id}" class="form-checkbox h-4 w-4 text-blue-600 mr-2">
        <span>${skill.name}</span>
      `;
      menu.appendChild(option);
    });

    function updateSelection() {
      const checked = Array.from(
        menu.querySelectorAll("input:checked")
      ).map((cb) => ({
        id: cb.value,
        name: cb.nextElementSibling.textContent,
      }));

      label.textContent = checked.length > 0 ? checked.map((c) => c.name).join(", ") : "Select skills";
      
      hiddenInput.value = checked.map((c) => c.id).join(",");
    }

    menu.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.addEventListener("change", updateSelection);
    });

  } catch (err) {
    console.error(err);
  }
}


document.addEventListener("DOMContentLoaded", () => {

  loadSkillsOptions();

  const toggle = document.getElementById("skills-toggle");
  const menu = document.getElementById("skills-menu");
  const postJobForm = document.getElementById("postJobForm");

  // --- Dropdown Toggle Logic ---
  if (toggle && menu) {
    toggle.addEventListener("click", () => menu.classList.toggle("hidden"));
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }

  // --- Form Submit Logic ---
  if (postJobForm) {
    postJobForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
    
      const selectedSkills = document.getElementById("skills-hidden").value;
      const skillIds = selectedSkills ? selectedSkills.split(",") : [];
      
      formData.delete('skills'); // Remove the hidden input's comma-separated value
      skillIds.forEach(id => {
        formData.append('skills_ids', id); // Append each skill ID individually
      });
    
      try {
        const res = await fetch(`${API}/jobs/job/create/`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + access,
          },
          body: formData, 
        });
    
        if (!res.ok) {
          const err = await res.json();
          throw new Error("Failed to post job ❌ " + JSON.stringify(err));
        }
    
        showNotification("Job posted successfully ✅", "success");
        window.location.href = "my-jobs.html";
      } catch (err) {
        showNotification(err.message, "error");
      }
    });
  }
});

document.getElementById("logout").addEventListener("click", () => {
  logout();
});