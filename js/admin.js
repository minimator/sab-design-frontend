const API_URL = "https://YOUR-BACKEND.onrender.com"; // replace with your backend URL

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const errorEl = document.getElementById("loginError");

// Check if admin is already logged in
function checkLogin() {
  const token = localStorage.getItem("token");
  if (token) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    loadMessages(); // load messages automatically
  } else {
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
}

// Call checkLogin on page load
checkLogin();

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
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

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      errorEl.innerText = "";

      loadMessages(); // automatically load messages after login
    } else {
      errorEl.innerText = data.message || "Invalid credentials";
    }
  } catch (err) {
    console.error(err);
    errorEl.innerText = "Server error. Please try again.";
  }
});

// Load messages from backend
async function loadMessages() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must login first!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/contact`, {
      headers: { "Authorization": "Bearer " + token }
    });

    const messages = await res.json();
    const container = document.getElementById("messages");
    container.innerHTML = "";

    if (!messages.length) {
      container.innerHTML = "<p>No messages found.</p>";
      return;
    }

    messages.forEach(msg => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.innerHTML = `
        <p><strong>Name:</strong> ${msg.name}</p>
        <p><strong>Email:</strong> ${msg.email}</p>
        <p><strong>Message:</strong> ${msg.message}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load messages");
  }
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  checkLogin(); // show login form again
}