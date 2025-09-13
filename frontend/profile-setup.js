document.addEventListener("DOMContentLoaded", () => {
  const { access, role } = getAuth();
  if (!access || !role) {
    window.location.href = "./auth.html";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${access}`,
  };

  async function loadProfile() {
    try {
      if (role === "recruiter") {
        const res = await fetch(`${API}/profiles/profile/recruiter/me/`, {
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          renderRecruiterView(data);
        }
      } else {
        const res = await fetch(`${API}/profiles/profile/freelancer/me/`, {
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          renderFreelancerView(data);
        }
      }
    } catch (err) {
      showAlert("Failed to load profile", "error");
    }
  }

  // --- Recruiter view ---
  function renderRecruiterView(data) {
    const view = document.getElementById("recruiter-view");
    const form = document.getElementById("recruiter-form");

    if (!view || !form) return;

    view.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Recruiter Profile</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Company Logo</h3>
        <p class="text-lg font-semibold mt-2">
          ${
            data.company_logo
              ? `<a href="${data.company_logo}" target="_blank" class="text-blue-600 hover:underline">Company Logo</a>`
              : "N/A"
          }
        </p>
      </div>

      <div class="border p-4 rounded-lg bg-gray-50">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Company Name</h3>
        <p class="text-lg font-semibold text-gray-800 mt-1">${
          data.company_name || "N/A"
        }</p>
      </div>
      <div class="border p-4 rounded-lg bg-gray-50">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Industry</h3>
        <p class="text-lg font-semibold text-gray-800 mt-1">${
          data.industry || "N/A"
        }</p>
      </div>

      <div class="border p-4 rounded-lg bg-gray-50">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Company Website</h3>
        <p class="text-lg font-semibold mt-1">
          ${
            data.company_website
              ? `<a href="${data.company_website}" target="_blank" class="text-blue-600 hover:underline">${data.company_website}</a>`
              : "N/A"
          }
        </p>
      </div>

      <div class="border p-4 rounded-lg bg-gray-50">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Phone no.</h3>
        <p class="text-lg font-semibold text-gray-800 mt-1">${
          data.phone || "N/A"
        }</p>
      </div>

      <div class="border p-4 rounded-lg bg-gray-50">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Email</h3>
        <p class="text-lg font-semibold text-gray-800 mt-1">${
          data.email || "N/A"
        }</p>
      </div>

      <div class="border p-4 rounded-lg bg-gray-50">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Location</h3>
        <p class="text-lg font-semibold text-gray-800 mt-1">${
          data.location || "N/A"
        }</p>
      </div>

      <div class="border p-4 rounded-lg bg-gray-50">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Linkedin URL</h3>
        <p class="text-lg font-semibold mt-1">
          ${
            data.linkedin_url
              ? `<a href="${data.linkedin_url}" target="_blank" class="text-blue-600 hover:underline">${data.linkedin_url}</a>`
              : "N/A"
          }
        </p>
      </div>

      <div class="border p-4 rounded-lg bg-gray-50 col-span-1 md:col-span-2">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">About</h3>
        <p class="text-gray-700 mt-1 leading-relaxed">${data.about || "N/A"}</p>
      </div>
    </div>

    <div class="mt-6 text-right">
      <button id="edit-recruiter"
        class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
        Edit Profile
      </button>
    </div>
  `;

    view.classList.remove("hidden");
    form.classList.add("hidden");

    // Edit button logic
    document.getElementById("edit-recruiter").onclick = () => {
      // Prefill
      form.company_logo_url = data.company_logo_url || "";
      form.company_name.value = data.company_name || "";
      form.company_website.value = data.company_website || "";
      form.location.value = data.location || "";
      form.about.value = data.about || "";
      form.industry = data.industry || "";
      form.phone = data.phone || "";
      form.email = data.email || "";
      form.linkedin_url = data.linkedin_url || "";


      view.classList.add("hidden");
      form.classList.remove("hidden");
    };

    // Cancel button (recruiter)
    const cancelRecruiter = document.getElementById("cancel-recruiter");
    if (cancelRecruiter) {
      cancelRecruiter.onclick = (e) => {
        e.preventDefault();
        renderRecruiterView(data);
      };
    }

    // Save handler
    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());

      if (
        payload.company_website &&
        !/^https?:\/\//i.test(payload.company_website)
      ) {
        payload.company_website = "https://" + payload.company_website;
      }

      if (
        payload.linkedin_url &&
        !/^https?:\/\//i.test(payload.linkedin_url)
      ) {
        payload.linkedin_url = "https://" + payload.linkedin_url;
      }

      try {
        const res = await fetch(`${API}/profiles/profile/recruiter/me/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${access}`,
          },
          body: fd,
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("Recruiter update error:", errData);
          throw new Error(JSON.stringify(errData));
        }

        const updated = await res.json();
        showAlert("Profile updated ✅");
        renderRecruiterView(updated);
      } catch (err) {
        showAlert(err.message, "error");
      }
    };
  }

  // --- Freelancer view ---
  function renderFreelancerView(data) {
    const view = document.getElementById("freelancer-view");
    const form = document.getElementById("freelancer-form");

    if (!view || !form) return;

    view.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Freelancer Profile</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Name</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.name || "N/A"
        }</p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Date of Birth</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.dob || "N/A"
        }</p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Phone No.</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.phone || "N/A"
        }</p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Email</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.email || "N/A"
        }</p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Location</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.location || "N/A"
        }</p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Education</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.education || "N/A"
        }</p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Experience</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.experience_display || "N/A"
        }</p>
      </div>

      
      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Skills</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.skills && data.skills.length > 0
            ? data.skills.map((s) => s.name).join(", ")
            : "N/A"
        }</p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Portfolio URL</h3>
        <p class="text-lg font-semibold mt-2">
          ${
            data.portfolio_url
              ? `<a href="${data.portfolio_url}" target="_blank" class="text-blue-600 hover:underline">${data.portfolio_url}</a>`
              : "N/A"
          }
        </p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">GitHub URL</h3>
        <p class="text-lg font-semibold mt-2">
          ${
            data.github_url
              ? `<a href="${data.github_url}" target="_blank" class="text-blue-600 hover:underline">${data.github_url}</a>`
              : "N/A"
          }
        </p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Linkedin URL</h3>
        <p class="text-lg font-semibold mt-2">
          ${
            data.linkedin_url
              ? `<a href="${data.linkedin_url}" target="_blank" class="text-blue-600 hover:underline">${data.linkedin_url}</a>`
              : "N/A"
          }
        </p>
      </div>

      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Resume</h3>
        <p class="text-lg font-semibold mt-2">
          ${
            data.resume
              ? `<a href="${data.resume}" target="_blank" class="text-blue-600 hover:underline">Download Resume</a>`
              : "N/A"
          }
        </p>
      </div>
      
      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Expected hourly rate (in USD)</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.expected_salary || "N/A"
        }</p>
      </div>
  
      <div class="w-full border p-5 rounded-xl bg-gray-50 shadow-sm">
        <h3 class="text-sm text-gray-500 uppercase tracking-wide">Availability</h3>
        <p class="text-lg font-semibold text-gray-800 mt-2">${
          data.availability_display || "N/A"
        }</p>
      </div>
    </div>


    <div class="mt-8 text-right">
      <button id="edit-freelancer"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
        Edit Profile
      </button>
    </div>
  `;

    view.classList.remove("hidden");
    form.classList.add("hidden");
    // Edit button logic
    const editBtn = document.getElementById("edit-freelancer");
    if (editBtn) {
      editBtn.onclick = () => {
        form.name.value = data.name || "";
        form.dob.value = data.dob || "";
        form.phone.value = data.phone || "";
        form.email.value = data.email || "";
        form.location.value = data.location || "";
        form.education.value = data.education || "";
        form.experience.value = data.experience || "";
        form.portfolio_url.value = data.portfolio_url || "";
        form.github_url.value = data.github_url || "";
        linkedin_url = data.linkedin_url || "";
        expected_salary = data.expected_salary || "";
        availability = data.availability || "";

        const selectedIds = data.skills
          ? data.skills.map((s) => s.id.toString())
          : [];
        loadSkillsOptions(selectedIds);

        view.classList.add("hidden");
        form.classList.remove("hidden");
      };
    }

    const cancelFreelancer = document.getElementById("cancel-freelancer");
    if (cancelFreelancer) {
      cancelFreelancer.onclick = (e) => {
        e.preventDefault();
        const menu = document.getElementById("skills-menu");
        if (menu) menu.classList.add("hidden");

        form.reset();

        const hiddenSkills = document.getElementById("skills-hidden");
        if (hiddenSkills) hiddenSkills.value = "";

        renderFreelancerView(data);
      };
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(form);

      if (
        fd.get("portfolio_url") &&
        !/^https?:\/\//i.test(fd.get("portfolio_url"))
      ) {
        fd.set("portfolio_url", "https://" + fd.get("portfolio_url"));
      }

      if (
        fd.get("github_uel") &&
        !/^https?:\/\//i.test(fd.get("github_url"))
      ) {
        fd.set("github_url", "https://" + fd.get("github_url"));
      }

      if (
        fd.get("linkedin_url") &&
        !/^https?:\/\//i.test(fd.get("linkedin_url"))
      ) {
        fd.set("linkedin_url", "https://" + fd.get("linkedin_url"));
      }

      const selectedSkills = Array.from(
        document.querySelectorAll("#skills-menu input[type='checkbox']:checked")
      ).map((cb) => cb.value);

      fd.delete("skills");

      selectedSkills.forEach((id) => fd.append("skill_ids", id));

      try {
        const res = await fetch(`${API}/profiles/profile/freelancer/me/`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${access}`,
          },
          body: fd,
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("Freelancer update error:", errData);
          throw new Error(JSON.stringify(errData));
        }

        const updated = await res.json();
        showAlert("Profile updated ✅");
        renderFreelancerView(updated);
      } catch (err) {
        showAlert(err.message, "error");
      }
    };
  }

  async function loadSkillsOptions(selectedIds = []) {
    try {
      const res = await fetch(`${API}/profiles/skills/`);
      if (res.ok) {
        const skills = await res.json();
        const menu = document.getElementById("skills-menu");
        const label = document.getElementById("skills-label");
        const hiddenInput = document.getElementById("skills-hidden");
        menu.innerHTML = "";

        skills.forEach((skill) => {
          const isChecked = selectedIds.includes(skill.id.toString());
          const option = document.createElement("label");
          option.className =
            "flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer";
          option.innerHTML = `
          <input type="checkbox" value="${
            skill.id
          }" class="form-checkbox h-4 w-4 text-blue-600 mr-2"
            ${isChecked ? "checked" : ""}>
          <span>${skill.name}</span>
        `;
          menu.appendChild(option);
        });

        function updateSelection() {
          const checked = Array.from(
            menu.querySelectorAll("input[type='checkbox']:checked")
          ).map((cb) => ({
            id: cb.value,
            name: cb.nextElementSibling.textContent,
          }));
          label.textContent =
            checked.length > 0
              ? checked.map((c) => c.name).join(", ")
              : "Select skills";
          hiddenInput.value = checked.map((c) => c.id).join(",");
        }

        menu.querySelectorAll("input[type='checkbox']").forEach((cb) => {
          cb.addEventListener("change", updateSelection);
        });

        updateSelection();
      }
    } catch (err) {
      console.error("Failed to load skills", err);
    }
  }
  loadSkillsOptions();
  loadProfile();
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("skills-toggle");
  const menu = document.getElementById("skills-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      menu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }
});
