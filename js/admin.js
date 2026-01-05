const API_URL = window.API_URL || "https://sab-design-backend.onrender.com/api";

// Elements
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginError = document.getElementById("loginError");

// Button elements for loading states
const loginButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
const projectButton = document.getElementById("projectForm") ? document.getElementById("projectForm").querySelector('button[type="submit"]') : null;

// Dashboard Stat Elements
const msgCount = document.getElementById("msgCount");
const projectCount = document.getElementById("projectCount");
const adminCount = document.getElementById("adminCount"); // Assuming this is hardcoded or fetched elsewhere

// Project management elements
const projectForm = document.getElementById("projectForm");
const projectsList = document.getElementById("projectsList");
const projectMsg = document.getElementById("projectMsg");

// =======================
// UTILITY FUNCTIONS
// =======================

/** Shows a loading state on a button. */
function showLoading(button, originalText) {
    if (button) {
        button.disabled = true;
        button.textContent = "Loading...";
        button.setAttribute('data-original-text', originalText);
    }
}

/** Hides the loading state on a button. */
function hideLoading(button) {
    if (button) {
        button.disabled = false;
        button.textContent = button.getAttribute('data-original-text') || 'Submit';
    }
}

/** Handles secure API calls with Bearer Token. */
async function secureFetch(endpoint, options = {}) {
    const token = localStorage.getItem("adminToken");
    if (!token) {
        logout();
        throw new Error("No token found");
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
}

// =======================
// AUTO LOGIN CHECK
// =======================
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        showDashboard();
    }
    // Initialize the password toggle even if not logged in
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
            togglePassword.classList.toggle("fa-eye-slash");
        });
    }
});


// =======================
// LOGIN
// =======================
if (loginForm && loginButton) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        loginError.textContent = "";
        
        // 1. Show Loading State
        showLoading(loginButton, "Login");

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
                loginError.textContent = data.message || "Login failed. Check credentials.";
                // Clear password for security
                document.getElementById("password").value = ''; 
                return;
            }

            localStorage.setItem("adminToken", data.token);
            showDashboard();
            loginForm.reset(); // Clear form on success

        } catch (err) {
            loginError.textContent = "Network or server error. Please check your connection.";
        } finally {
            // 3. Hide Loading State
            hideLoading(loginButton);
        }
    });
}

// =======================
// DASHBOARD VISIBILITY & DATA LOADING
// =======================
async function showDashboard() {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    
    // Load all necessary dashboard data when it becomes visible
    await loadStats(); 
    await loadProjects(); 
}

// =======================
// LOGOUT
// =======================
function logout() {
    localStorage.removeItem("adminToken");
    // Simple way to refresh the page and force login section visibility
    location.reload(); 
}
// NOTE: Logout button event listener is kept in the HTML script block for simplicity

// =======================
// LOAD STATS (NEW FUNCTIONALITY)
// =======================
async function loadStats() {
    // Set initial loading state for stats
    if (msgCount) msgCount.textContent = '...';
    if (projectCount) projectCount.textContent = '...';
    // adminCount is often static, but let's assume 1 for now if no admin endpoint exists
    if (adminCount) adminCount.textContent = '1'; 

    try {
        // Fetch Messages count
        const msgRes = await secureFetch('/contact');
        const messages = await msgRes.json();
        if (msgCount) msgCount.textContent = msgRes.ok ? messages.length : 'Err';

        // Fetch Projects count
        const projectRes = await secureFetch('/projects');
        const projects = await projectRes.json();
        if (projectCount) projectCount.textContent = projectRes.ok ? projects.length : 'Err';

    } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
        if (msgCount) msgCount.textContent = 'Err';
        if (projectCount) projectCount.textContent = 'Err';
        // A generic alert or message to the user might be useful here
    }
}

// =======================
// LOAD PROJECTS (NEW FUNCTIONALITY)
// =======================
async function loadProjects() {
    if (!projectsList) return;

    projectsList.innerHTML = '<p style="text-align:center; color:#999;"><i class="fa fa-spinner fa-spin"></i> Loading projects...</p>';

    try {
        const res = await secureFetch('/projects');
        const projects = await res.json();

        if (!res.ok) throw new Error(projects.message || "Failed to fetch projects");

        projectsList.innerHTML = '';
        if (projects.length === 0) {
            projectsList.innerHTML = '<p style="text-align:center; color:#666;">No projects found yet.</p>';
            return;
        }

        projects.reverse().forEach(p => {
            projectsList.innerHTML += `
                <div data-project-id="${p._id}">
                    <strong style="color:var(--primary-color);">${p.title}</strong> 
                    <button onclick="deleteProject('${p._id}')" class="btn btn-secondary" style="float:right; padding: 5px 10px; font-size: 14px; background-color: #dc3545; border-color: #dc3545;">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                    <p style="margin-top:5px; margin-bottom: 0;">${p.description.substring(0, 100)}...</p>
                    <small style="color:#999;">Image: ${p.image}</small>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error loading projects:", err);
        projectsList.innerHTML = '<p style="color:red; text-align:center;">Failed to load projects list.</p>';
    }
}


// =======================
// DELETE PROJECT (NEW FUNCTIONALITY)
// =======================
async function deleteProject(projectId) {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        return;
    }

    try {
        const res = await secureFetch(`/projects/${projectId}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error();

        // Remove the project element from the list
        document.querySelector(`[data-project-id="${projectId}"]`).remove();
        alert("Project deleted successfully!");
        
        // Refresh stats
        await loadStats(); 

    } catch (err) {
        alert("Failed to delete project. Please try again.");
    }
}
// Make the function globally available
window.deleteProject = deleteProject; 


// =======================
// ADD PROJECT
// =======================
if (projectForm && projectButton) {
    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Clear message and show loading
        projectMsg.textContent = "";
        showLoading(projectButton, "Upload Project");
        
        const data = {
            title: document.getElementById("title").value,
            image: document.getElementById("image").value,
            description: document.getElementById("description").value
        };

        try {
            const res = await secureFetch('/projects', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Upload failed");
            }

            // Success feedback
            projectMsg.style.color = "green";
            projectMsg.textContent = "Project added successfully! Refreshing list...";
            projectForm.reset();
            
            // Refresh the project list and stats
            await loadProjects(); 
            await loadStats();

        } catch (error) {
            // Error feedback
            projectMsg.style.color = "red";
            projectMsg.textContent = error.message || "Failed to upload project";
            console.error("Project upload error:", error);
        } finally {
            // Hide loading state
            hideLoading(projectButton);
        }
    });
}