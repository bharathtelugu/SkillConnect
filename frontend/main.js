// main.js - shared utilities for all pages

// API base
const API = "http://127.0.0.1:8000/";

function renderNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const role = localStorage.getItem("role");

  if (role === "recruiter") {
    navbar.innerHTML = `
    <button onclick="window.location.href='recruiter_dashboard.html'" class="text-gray-700 hover:text-blue-600">Dashboard</button>
    <button onclick="window.location.href='post-job.html'" class="text-gray-700 hover:text-blue-600">Post Job</button>
    <button onclick="window.location.href='my-jobs.html'" class="text-gray-700 hover:text-blue-600">My Jobs</button>
    <button onclick="window.location.href='applications.html'" class="text-gray-700 hover:text-blue-600">Applications</button>
    <button onclick="window.location.href='profile-setup.html'" class="text-gray-700 hover:text-blue-600">Profile (${role})</button>
    <button id="logout" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
    `;
  } else if (role === "freelancer") {
    navbar.innerHTML = `
        <div class="relative" id="notification-container">
        <button id="notification-bell" class="text-gray-500 hover:text-blue-600 relative flex items-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span id="notification-badge" class="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white hidden"></span>
        </button>
        <div id="notification-dropdown" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20 hidden">
            <div class="py-2 px-4 text-sm font-semibold text-gray-700 border-b">
                <span>Notifications</span>
            </div>
            <div id="notification-list" class="divide-y max-h-96 overflow-y-auto">
                </div>
        </div>
    </div>
    <button onclick="window.location.href='freelancer_dashboard.html'" class="text-gray-700 hover:text-blue-600">Dashboard</button>
    <button onclick="window.location.href='jobs.html'" class="text-gray-700 hover:text-blue-600">Browse Jobs</button>
    <button onclick="window.location.href='my-applications.html'" class="text-gray-700 hover:text-blue-600">My Applications</button>
    <button onclick="window.location.href='profile-setup.html'" class="text-gray-700 hover:text-blue-600">Profile (${role})</button>
    <button id="logout" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Logout</button>
    `;
  } else {
    navbar.innerHTML = `
      <a href="./index.html#features" class="text-gray-600 hover:text-blue-600">Features</a>
      <a href="./index.html#about" class="text-gray-600 hover:text-blue-600">About</a>
      <a href="./auth.html" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Login / Register</a>
    `;
  }

  // Logout handler
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "auth.html";
    });
  }
}

// Call this when page loads
renderNavbar();

// Get access token + role
function getAuth() {
  return {
    access: localStorage.getItem("access"),
    role: localStorage.getItem("role"),
  };
}

// Clear session & redirect
function logout() {
  localStorage.clear();
  window.location.href = "./auth.html";
}

function showAlert(message, type = "success") {
  const existing = document.querySelectorAll(".custom-alert");
  existing.forEach((el) => el.remove());

  const alertBox = document.createElement("div");
  alertBox.className = `custom-alert fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition transform duration-500 ease-in-out z-50 ${
    type === "error" ? "bg-red-600" : "bg-green-600"
  }`;

  alertBox.textContent = message;
  document.body.appendChild(alertBox);

  // Show animation
  alertBox.style.opacity = "0";
  alertBox.style.transform = "translateY(-10px)";
  requestAnimationFrame(() => {
    alertBox.style.opacity = "1";
    alertBox.style.transform = "translateY(0)";
  });

  // Auto-remove
  setTimeout(() => {
    alertBox.style.opacity = "0";
    alertBox.style.transform = "translateY(-10px)";
    setTimeout(() => alertBox.remove(), 500);
  }, 3000);
}

// Global notification system
function showNotification(message, type = "success") {
  const containerId = "notification-container";
  let container = document.getElementById(containerId);

  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.className = "fixed bottom-5 right-5 space-y-3 z-50";
    document.body.appendChild(container);
  }

  const notif = document.createElement("div");
  notif.className = `
    px-4 py-3 rounded-lg shadow-md text-white 
    ${type === "success" ? "bg-green-600" : "bg-red-600"}
    animate-fade-in
  `;
  notif.textContent = message;

  container.appendChild(notif);

  // Auto remove after 3s
  setTimeout(() => {
    notif.classList.add("opacity-0", "transition", "duration-500");
    setTimeout(() => notif.remove(), 500);
  }, 3000);
}


async function handleNotifications() {
    const { access, role } = getAuth();
    if (role !== 'freelancer' || !access) return;

    const bell = document.getElementById('notification-bell');
    const badge = document.getElementById('notification-badge');
    const dropdown = document.getElementById('notification-dropdown');
    const list = document.getElementById('notification-list');

    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        if (!dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });

    try {
        const res = await fetch(`${API}/profiles/notifications/`, {
            headers: { Authorization: `Bearer ${access}` }
        });
        if (!res.ok) throw new Error('Could not fetch notifications.');
        const notifications = await res.json();

        if (notifications.length > 0) {
            badge.classList.remove('hidden');
            list.innerHTML = notifications.map(n => `
                <a href="${n.link || '#'}" 
                   class="notification-item block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                   data-id="${n.id}">
                    <p class="font-semibold">${n.verb}</p>
                    <p class="text-xs text-gray-500">${new Date(n.timestamp).toLocaleString()}</p>
                </a>
            `).join('');
        } else {
            list.innerHTML = `<p class="text-center text-sm text-gray-500 py-4">No new notifications</p>`;
            badge.classList.add('hidden');
        }
    } catch (err) {
        list.innerHTML = `<p class="text-center text-sm text-red-500 py-4">Error loading notifications</p>`;
        console.error(err);
    }

    list.addEventListener('click', async (e) => {
        const notificationItem = e.target.closest('.notification-item');
        if (!notificationItem) return;

        const notificationId = notificationItem.dataset.id;
        
        notificationItem.style.opacity = '0.5';
        notificationItem.style.pointerEvents = 'none';

        try {
            await fetch(`${API}/profiles/notifications/${notificationId}/read/`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${access}` }
            });
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            notificationItem.style.opacity = '1';
            notificationItem.style.pointerEvents = 'auto';
        }
    });
}
