const API_URL = window.API_URL || "https://sab-design-backend.onrender.com/api";

// Elements
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginError = document.getElementById("loginError");

// =======================
// AUTO LOGIN CHECK
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    showDashboard();
  }
});

// =======================
// LOGIN
// =======================
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        loginError.textContent = data.message || "Login failed";
        return;
      }

      localStorage.setItem("adminToken", data.token);
      showDashboard();

    } catch (err) {
      loginError.textContent = "Server error. Try again.";
    }
  });
}

// =======================
// DASHBOARD VISIBILITY
// =======================
function showDashboard() {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
}

// =======================
// LOGOUT
// =======================
function logout() {
  localStorage.removeItem("adminToken");
  location.reload();
}

// =======================
// LOAD MESSAGES (SECURED)
// =======================
async function loadMessages() {
  const token = localStorage.getItem("adminToken");
  if (!token) return logout();

  try {
    const res = await fetch(`${API_URL}/contact`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    data.forEach(m => {
      messagesDiv.innerHTML += `
        <div style="border:1px solid #ddd; padding:10px; margin-bottom:10px;">
          <strong>${m.name}</strong> (${m.email})<br/>
          ${m.message}
        </div>
      `;
    });

  } catch (err) {
    alert("Failed to load messages");
  }
}

// =======================
// PASSWORD TOGGLE
// =======================
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
    togglePassword.classList.toggle("fa-eye-slash");
  });
}

const projectForm = document.getElementById("projectForm");
const projectMsg = document.getElementById("projectMsg");

if (projectForm) {
  projectForm.addEventListener("submit", async (e) => {
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error();

      projectMsg.style.color = "green";
      projectMsg.textContent = "Project added successfully";
      projectForm.reset();
    } catch {
      projectMsg.style.color = "red";
      projectMsg.textContent = "Failed to upload project";
    }
  });
}