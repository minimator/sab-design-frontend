const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginError = document.getElementById("loginError");

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // ⛔ stops page refresh

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      loginError.textContent = data.message || "Login failed";
      return;
    }

    localStorage.setItem("adminToken", data.token);

    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
  } catch (err) {
    loginError.textContent = "Server error";
  }
});

// SHOW / HIDE PASSWORD
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

// LOAD MESSAGES (example)
async function loadMessages() {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    alert("Not authorized");
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const messages = await res.json();
  document.getElementById("messages").innerHTML =
    "<pre>" + JSON.stringify(messages, null, 2) + "</pre>";
}

// LOGOUT
function logout() {
  localStorage.removeItem("adminToken");
  location.reload();
}