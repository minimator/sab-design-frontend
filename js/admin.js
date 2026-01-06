// ========================
// ELEMENTS
// ========================
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginError = document.getElementById("loginError");

const logoutBtn = document.getElementById("logoutBtn");

const msgCount = document.getElementById("msgCount");
const projectCount = document.getElementById("projectCount");
const adminCount = document.getElementById("adminCount");

const projectForm = document.getElementById("projectForm");
const projectsList = document.getElementById("projectsList");
const projectMsg = document.getElementById("projectMsg");

// ========================
// TOKEN HELPERS
// ========================
const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

// ========================
// AUTO LOGIN
// ========================
document.addEventListener("DOMContentLoaded", () => {
  if (getToken()) {
    showDashboard();
    loadAnalytics();
    loadProjects();
  }
});

// ========================
// LOGIN
// ========================
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        loginError.innerText = data.message || "Login failed";
        return;
      }

      localStorage.setItem("token", data.token);
      showDashboard();
      loadAnalytics();
      loadProjects();
    } catch (err) {
      loginError.innerText = "Server error. Try again.";
    }
  });
}

// ========================
// LOGOUT
// ========================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
  });
}

// ========================
// UI HELPERS
// ========================
function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
}

// ========================
// ANALYTICS
// ========================
async function loadAnalytics() {
  try {
    const res = await fetch(`${API_URL}/api/admin/stats`, {
      headers: authHeader()
    });
    const data = await res.json();

    msgCount.innerText = data.messages || 0;
    projectCount.innerText = data.projects || 0;
    adminCount.innerText = data.admins || 0;
  } catch (err) {
    console.error("Analytics error", err);
  }
}

// ========================
// ADD PROJECT
// ========================
if (projectForm) {
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const image = document.getElementById("image").value;
    const description = document.getElementById("description").value;

    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ title, image, description })
      });

      const data = await res.json();

      if (!res.ok) {
        projectMsg.style.color = "red";
        projectMsg.innerText = data.message || "Failed";
        return;
      }

      projectMsg.style.color = "green";
      projectMsg.innerText = "Project added!";
      projectForm.reset();
      loadProjects();
      loadAnalytics();
    } catch (err) {
      projectMsg.innerText = "Server error";
    }
  });
}

// ========================
// LOAD PROJECTS
// ========================
async function loadProjects() {
  projectsList.innerHTML = "Loading...";

  try {
    const res = await fetch(`${API_URL}/api/projects`);
    const projects = await res.json();

    projectsList.innerHTML = "";

    projects.forEach((p) => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ddd";
      div.style.padding = "15px";
      div.style.marginBottom = "10px";

      div.innerHTML = `
        <strong>${p.title}</strong>
        <p>${p.description}</p>
        <img src="${p.image}" style="max-width:150px;"><br><br>

        <button onclick="editProject('${p._id}')" class="btn btn-secondary">Edit</button>
        <button onclick="deleteProject('${p._id}')" class="btn btn-danger">Delete</button>
      `;

      projectsList.appendChild(div);
    });
  } catch (err) {
    projectsList.innerText = "Failed to load projects";
  }
}

// ========================
// DELETE PROJECT
// ========================
async function deleteProject(id) {
  if (!confirm("Delete this project?")) return;

  try {
    await fetch(`${API_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: authHeader()
    });

    loadProjects();
    loadAnalytics();
  } catch (err) {
    alert("Delete failed");
  }
}

// ========================
// EDIT PROJECT (SIMPLE PROMPT)
// ========================
async function editProject(id) {
  const title = prompt("New title:");
  const description = prompt("New description:");
  const image = prompt("New image URL:");

  if (!title || !description || !image) return;

  try {
    await fetch(`${API_URL}/api/projects/${id}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify({ title, description, image })
    });

    loadProjects();
  } catch (err) {
    alert("Update failed");
  }
}