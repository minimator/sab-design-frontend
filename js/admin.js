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
// LOAD STATS
// ========================

async function loadStats() {
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const data = await res.json();
  msgCount.textContent = data.messages;
  projectCount.textContent = data.projects;
  adminCount.textContent = data.admins;
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
// LOAD MESSAGES
// ========================
async function loadMessages() {
  const res = await fetch(`${API_URL}/api/contact`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const messages = await res.json();
  document.getElementById("messages").innerHTML = messages.map(m => `
    <div>
      <strong>${m.name}</strong> (${m.email})
      <p>${m.message}</p>
      <hr/>
    </div>
  `).join("");
}


// ========================
// ADD PROJECT
// ========================
if (projectForm) {
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const imageFile = document.getElementById("imageFile").files[0];
    const token = localStorage.getItem("token");

    if (!imageFile) {
      projectMsg.style.color = "red";
      projectMsg.textContent = "Please select an image";
      return;
    }

    try {
      /* ================= 1️⃣ UPLOAD IMAGE ================= */
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        projectMsg.textContent = "Image upload failed";
        return;
      }

      /* ================= 2️⃣ SAVE PROJECT ================= */
      const projectRes = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          image: uploadData.url
        })
      });

      const data = await projectRes.json();

      if (!projectRes.ok) {
        projectMsg.style.color = "red";
        projectMsg.textContent = data.message || "Project save failed";
        return;
      }

      projectMsg.style.color = "green";
      projectMsg.textContent = "Project uploaded successfully ✅";
      projectForm.reset();
      loadProjects();
      loadAnalytics();

    } catch (err) {
      console.error(err);
      projectMsg.style.color = "red";
      projectMsg.textContent = "Server error";
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