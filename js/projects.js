const projectsGrid = document.getElementById("projectsGrid");

fetch(`${API_URL}/api/projects`)
  .then(res => res.json())
  .then(projects => {
    if (!projects.length) {
      projectsGrid.innerHTML = "<p>No projects yet.</p>";
      return;
    }

    projectsGrid.innerHTML = projects.map(p => `
      <div class="project-card">
        <img src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
      </div>
    `).join("");
  })
  .catch(() => {
    projectsGrid.innerHTML = "<p>Error loading projects</p>";
  });