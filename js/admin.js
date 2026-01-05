const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const passwordInput = document.getElementById("password");

// Show/hide password
const togglePassword = document.createElement("input");
togglePassword.type = "checkbox";
togglePassword.id = "togglePassword";
togglePassword.style.marginLeft = "10px";
loginForm.appendChild(togglePassword);
const label = document.createElement("label");
label.innerText = "Show";
label.htmlFor = "togglePassword";
loginForm.appendChild(label);

togglePassword.addEventListener("change", () => {
  passwordInput.type = togglePassword.checked ? "text" : "password";
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = passwordInput.value;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
  } catch (err) {
    console.error(err);
    loginError.textContent = "Cannot reach server";
  }
});

// Logout function
function logout() {
  localStorage.removeItem("adminToken");
  dashboardSection.style.display = "none";
  loginSection.style.display = "block";
}