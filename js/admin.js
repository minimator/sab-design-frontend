const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

/* SHOW / HIDE PASSWORD */
togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

/* LOGIN */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload

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
    loadMessages();

  } catch (err) {
    loginError.textContent = "Server error. Try again.";
  }
});

/* LOAD MESSAGES */
async function loadMessages() {
  const token = localStorage.getItem("adminToken");
  if (!token) return;

  const res = await fetch(`${API_BASE_URL}/api/contact`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const messages = await res.json();
  const container = document.getElementById("messages");
  container.innerHTML = "";

  messages.forEach(msg => {
    container.innerHTML += `
      <div class="card">
        <h4>${msg.name}</h4>
        <p>${msg.email}</p>
        <p>${msg.message}</p>
        <hr/>
      </div>
    `;
  });
}

/* AUTO LOGIN */
if (localStorage.getItem("adminToken")) {
  loginSection.style.display = "none";
  dashboardSection.style.display = "block";
  loadMessages();
}