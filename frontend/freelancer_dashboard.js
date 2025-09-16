// Welcome Section - Dynamic Date
const todayDate = document.getElementById('today-date');
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const today = new Date();
todayDate.textContent = today.toLocaleDateString('en-US', options);

// KPI Cards - Number Animation
const animatedNumbers = document.querySelectorAll('.animated-number');
animatedNumbers.forEach(element => {
    const target = parseInt(element.getAttribute('data-target'));
    let current = 0;
    const increment = target / 200;

    const updateNumber = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.ceil(current);
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = target;
        }
    };
    updateNumber();
});

// Profile Score Animation
const profileScore = document.getElementById('profile-score');
const profileProgress = document.getElementById('profile-progress');
const scoreTarget = parseInt(profileScore.getAttribute('data-target'));
let scoreCurrent = 0;
const scoreIncrement = scoreTarget / 100;

const updateScore = () => {
    scoreCurrent += scoreIncrement;
    if (scoreCurrent < scoreTarget) {
        profileScore.textContent = Math.ceil(scoreCurrent);
        profileProgress.style.width = `${Math.ceil(scoreCurrent)}%`;
        requestAnimationFrame(updateScore);
    } else {
        profileScore.textContent = scoreTarget;
        profileProgress.style.width = `${scoreTarget}%`;
    }
};
updateScore();

// Charts
const barChartCtx = document.getElementById('barChart').getContext('2d');
const pieChartCtx = document.getElementById('pieChart').getContext('2d');

new Chart(barChartCtx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Applications',
            data: [15, 20, 25, 18, 22, 30],
            backgroundColor: '#2563eb',
            borderRadius: 5,
            barThickness: 20
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#e5e7eb' },
                ticks: { color: '#6b7280' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280' }
            }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

new Chart(pieChartCtx, {
    type: 'pie',
    data: {
        labels: ['Pending', 'Accepted', 'Rejected'],
        datasets: [{
            label: 'Application Status',
            data: [12, 3, 20],
            backgroundColor: ['#2563eb', '#34d399', '#ef4444'],
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#6b7280',
                    usePointStyle: true
                }
            }
        }
    }
});

// Mobile Navbar Toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

// Profile Dropdown Toggle
const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');

profileBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    profileDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('active');
    }
});