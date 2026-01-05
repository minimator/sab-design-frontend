// frontend/js/admin.js

const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginError = document.getElementById("loginError");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    loginError.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
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
      loginError.textContent = "Server error. Try again.";
      console.error(err);
    }
  });
}

// Logout
function logout() {
  localStorage.removeItem("adminToken");
  location.reload();
}

// Auto login if token exists
if (localStorage.getItem("adminToken")) {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
}
