const fallbackRepositories = [
  {
    name: "PlayWright",
    description: "Playwright POM using Excel test data.",
    language: "TypeScript",
    stars: 1,
    html_url: "https://github.com/krisbyan22/PlayWright",
    homepage: ""
  },
  {
    name: "Maven-Selenium-Using-Test-Data-Excel",
    description: "POM using Excel test data.",
    language: "JavaScript",
    stars: 1,
    html_url: "https://github.com/krisbyan22/Maven-Selenium-Using-Test-Data-Excel",
    homepage: ""
  },
  {
    name: "K6",
    description: "K6 performance test using Windows.",
    language: "JavaScript",
    stars: 1,
    html_url: "https://github.com/krisbyan22/K6",
    homepage: ""
  },
  {
    name: "MAESTRO-MOBILE",
    description: "Sample Android automation project using Maestro.",
    language: "JavaScript",
    stars: 1,
    html_url: "https://github.com/krisbyan22/MAESTRO-MOBILE",
    homepage: ""
  },
  {
    name: "Katalon-Kafka",
    description: "Kafka learning experiments with Katalon.",
    language: "Groovy",
    stars: 0,
    html_url: "https://github.com/krisbyan22/Katalon-Kafka",
    homepage: ""
  },
  {
    name: "Cypress",
    description: "Cypress BDD practice with Allure integration.",
    language: "JavaScript",
    stars: 0,
    html_url: "https://github.com/krisbyan22/Cypress",
    homepage: ""
  }
];

const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const repoGrid = document.querySelector("[data-repo-grid]");
const year = document.querySelector("#year");

const activateNav = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
};

const repoTemplate = (repo) => {
  const description = repo.description || "Repository details available on GitHub.";
  const demoLink = repo.homepage
    ? `<a class="repo-link" href="${repo.homepage}" target="_blank" rel="noreferrer">Live demo</a>`
    : "";

  return `
    <article class="card repo-card">
      <div>
        <p class="card-label">GitHub Repository</p>
        <h3>${repo.name}</h3>
        <p>${description}</p>
      </div>
      <div class="repo-meta">
        <span>${repo.language || "Mixed stack"}</span>
        <span>${repo.stars || 0} star${repo.stars === 1 ? "" : "s"}</span>
      </div>
      <div class="repo-actions">
        <a class="repo-link" href="${repo.html_url}" target="_blank" rel="noreferrer">View code</a>
        ${demoLink}
      </div>
    </article>
  `;
};

const renderRepositories = (repositories) => {
  repoGrid.innerHTML = repositories.map(repoTemplate).join("");
};

const loadRepositories = async () => {
  try {
    const response = await fetch("https://api.github.com/users/krisbyan22/repos?sort=updated&per_page=12");
    if (!response.ok) {
      throw new Error("GitHub API unavailable");
    }

    const repositories = await response.json();
    const publicRepos = repositories
      .filter((repo) => !repo.fork)
      .sort((first, second) => new Date(second.pushed_at) - new Date(first.pushed_at))
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        html_url: repo.html_url,
        homepage: repo.homepage || ""
      }));

    renderRepositories(publicRepos.length ? publicRepos : fallbackRepositories);
  } catch (error) {
    renderRepositories(fallbackRepositories);
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries.find((entry) => entry.isIntersecting);
    if (visibleEntry) {
      activateNav(visibleEntry.target.id);
    }
  },
  {
    threshold: 0.4,
    rootMargin: "-10% 0px -20% 0px"
  }
);

sections.forEach((section) => observer.observe(section));
loadRepositories();

if (year) {
  year.textContent = new Date().getFullYear();
}
