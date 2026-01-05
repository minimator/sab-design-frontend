// ======== admin.js ========

// Fallback if API_URL is not defined
if (typeof API_URL === "undefined") {
  var API_URL = "http://localhost:5000"; // local fallback
}

// DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const togglePassword = document.getElementById("togglePassword");

// ======= Show/Hide Password =======
if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.classList.toggle("fa-eye-slash");
  });
}

// ======= Check if already logged in =======
const token = localStorage.getItem("token");
if (token) {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
}

// ======= Login Form Submit =======
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      loginError.textContent = "Email and password required";
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        loginError.textContent = data.message || "Login failed. Try again.";
        return;
      }

      // Save token and show dashboard
      localStorage.setItem("token", data.token);
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";

      loadMessages(); // optional, load messages immediately
    } catch (err) {
      console.error(err);
      loginError.textContent = "Server error. Try again later.";
    }
  });
}

// ======= Logout Function =======
function logoutAdmin() {
  localStorage.removeItem("token");
  loginSection.style.display = "block";
  dashboardSection.style.display = "none";
}

// ======= Load Messages (Example API) =======
async function loadMessages() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "Loading...";

  const token = localStorage.getItem("token");
  if (!token) {
    messagesDiv.innerHTML = "Not authorized";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/contact`, {
      headers: { "Authorization": "Bearer " + token }
    });

    if (!res.ok) {
      messagesDiv.innerHTML = "Failed to fetch messages";
      return;
    }

    const messages = await res.json();

    if (!messages.length) {
      messagesDiv.innerHTML = "No messages yet";
      return;
    }

    messagesDiv.innerHTML = messages
      .map(
        (m) =>
          `<div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
            <strong>${m.name} (${m.email})</strong><br>
            ${m.message}
          </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    messagesDiv.innerHTML = "Server error";
  }
}
