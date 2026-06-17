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
  }
];

const homeView = document.querySelector('[data-view="home"]');
const profileView = document.querySelector('[data-view="profile"]');
const navLinks = [...document.querySelectorAll(".nav-link")];
const contentSections = [...document.querySelectorAll(".profile-view .content-section")];
const repoGrid = document.querySelector("[data-repo-grid]");

let routeLockedByClick = false;

const routeAliases = {
  projects: "portfolio"
};

const parseRoute = () => {
  const hash = window.location.hash || "#/";
  const cleaned = hash.replace(/^#\/?/, "");
  if (!cleaned) {
    return "home";
  }

  return routeAliases[cleaned] || cleaned;
};

const markActiveLink = (route) => {
  navLinks.forEach((link) => {
    const linkRoute = link.dataset.route;
    const isActive = route === "home"
      ? linkRoute === "home"
      : linkRoute === route;
    link.classList.toggle("is-active", isActive);
  });
};

const showRoute = (route, shouldScroll = true) => {
  const isHome = route === "home";

  homeView.hidden = !isHome;
  profileView.hidden = isHome;
  document.body.classList.toggle("route-home", isHome);
  document.body.classList.toggle("route-profile", !isHome);
  markActiveLink(route);

  if (!isHome) {
    const targetSection = document.getElementById(route) || document.getElementById("about");
    if (shouldScroll && targetSection) {
      window.requestAnimationFrame(() => {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  } else if (shouldScroll) {
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
};

const repoTemplate = (repo) => {
  const description = repo.description || "Repository details available on GitHub.";
  const demoLink = repo.homepage
    ? `<a class="repo-link" href="${repo.homepage}" target="_blank" rel="noreferrer">Live demo</a>`
    : "";

  return `
    <article class="repo-card">
      <div>
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
    const response = await fetch("https://api.github.com/users/krisbyan22/repos?sort=updated&per_page=20");
    if (!response.ok) {
      throw new Error("GitHub API unavailable");
    }

    const repositories = await response.json();
    const publicRepos = repositories
      .filter((repo) => !repo.fork)
      .filter((repo) => !["KrisBiyantoro.github.io", "krisbyan22.github.io"].includes(repo.name))
      .sort((first, second) => new Date(second.pushed_at) - new Date(first.pushed_at))
      .slice(0, 4)
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
    if (document.body.classList.contains("route-home") || routeLockedByClick) {
      return;
    }

    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (!visibleEntry) {
      return;
    }

    const route = visibleEntry.target.id;
    markActiveLink(route);
    const targetHash = `#/${route}`;
    if (window.location.hash !== targetHash) {
      history.replaceState(null, "", targetHash);
    }
  },
  {
    threshold: [0.35, 0.6],
    rootMargin: "-10% 0px -45% 0px"
  }
);

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const route = link.dataset.route;
    routeLockedByClick = true;
    window.location.hash = route === "home" ? "#/" : `#/${route}`;
    showRoute(route, true);
    window.setTimeout(() => {
      routeLockedByClick = false;
    }, 700);
  });
});

contentSections.forEach((section) => observer.observe(section));

window.addEventListener("hashchange", () => {
  const route = parseRoute();
  showRoute(route, false);
});

const initialRoute = parseRoute();
showRoute(initialRoute, initialRoute !== "home");
loadRepositories();
