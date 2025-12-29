// ============ PASSWORD VISIBILITY TOGGLE ============
const passwordToggle = document.getElementById("passwordToggle");
const passwordInput = document.getElementById("password");

if (passwordToggle && passwordInput) {
  passwordToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    
    // Toggle icon
    const icon = passwordToggle.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
}

// ============ LOGIN FORM SUBMISSION ============
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginError = document.getElementById("loginError");

  // Clear previous errors
  loginError.textContent = "";

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      loginError.textContent = data.message || "Login failed. Please check your credentials.";
    }
  } catch (error) {
    console.error("Login error:", error);
    loginError.textContent = "An error occurred. Please try again later.";
  }
});
