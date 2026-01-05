const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const dashboardSection = document.getElementById("dashboard-section");
const loginSection = document.getElementById("login-section");
const togglePassword = document.getElementById("togglePassword");

const projectForm = document.getElementById("projectForm");
const projectMsg = document.getElementById("projectMsg");
const projectsList = document.getElementById("projectsList");

const logoutBtn = document.getElementById("logoutBtn");

// ====== PASSWORD SHOW/HIDE ======
togglePassword?.addEventListener("click", () => {
  const passwordInput = document.getElementById("password");
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.classList.toggle("fa-eye-slash");
});

// ====== LOGIN ======
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("adminToken", data.token);
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";

    loadStats();
    loadProjects();
  } catch (err) {
    loginError.textContent = err.message;
  }
});

// ====== LOGOUT ======
logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  dashboardSection.style.display = "none";
  loginSection.style.display = "block";
});

// ====== DASHBOARD STATS ======
async function loadStats() {
  try {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById("msgCount").textContent = data.messages;
    document.getElementById("projectCount").textContent = data.projects;
    document.getElementById("adminCount").textContent = data.admins;
  } catch {
    console.error("Failed to load stats");
  }
}

// ====== UPLOAD PROJECT ======
projectForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("adminToken");
  const data = {
    title: document.getElementById("title").value,
    image: document.getElementById("image").value,
    description: document.getElementById("description").value
  };

  try {
    const res = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();
    projectMsg.style.color = "green";
    projectMsg.textContent = "Project added successfully";
    projectForm.reset();
    loadProjects();
  } catch {
    projectMsg.style.color = "red";
    projectMsg.textContent = "Failed to upload project";
  }
});

// ====== LOAD PROJECTS ======
async function loadProjects() {
  try {
    const res = await fetch(`${API_URL}/projects`);
    const projects = await res.json();
    projectsList.innerHTML = projects.map(p => `
      <div style="border:1px solid #ddd; padding:10px; margin-bottom:10px;">
        <strong>${p.title}</strong><br />
        <img src="${p.image}" alt="${p.title}" style="width:100px; margin-top:5px;" /><br />
        <p>${p.description}</p>
      </div>
    `).join("");
  } catch {
    projectsList.innerHTML = "<p>Failed to load projects</p>";
  }
}

// ====== AUTO LOGIN ======
if (localStorage.getItem("adminToken")) {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
  loadStats();
  loadProjects();
}
