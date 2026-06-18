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
const skillGallery = document.querySelector(".skills-gallery");
const skillCards = [...document.querySelectorAll(".skills-gallery .skill-card")];

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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const setSkillOffset = (card, x, y) => {
  card.dataset.dragX = `${x}`;
  card.dataset.dragY = `${y}`;
  card.style.setProperty("--drag-x", `${x}px`);
  card.style.setProperty("--drag-y", `${y}px`);
};

const getSkillBounds = (card) => {
  if (!skillGallery) {
    return null;
  }

  const galleryRect = skillGallery.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const currentX = Number(card.dataset.dragX || 0);
  const currentY = Number(card.dataset.dragY || 0);
  const baseX = cardRect.left - galleryRect.left - currentX;
  const baseY = cardRect.top - galleryRect.top - currentY;

  return {
    minX: -baseX,
    maxX: galleryRect.width - baseX - cardRect.width,
    minY: -baseY,
    maxY: galleryRect.height - baseY - cardRect.height
  };
};

const clampSkillOffset = (card) => {
  const bounds = getSkillBounds(card);
  if (!bounds) {
    return;
  }

  const currentX = Number(card.dataset.dragX || 0);
  const currentY = Number(card.dataset.dragY || 0);
  setSkillOffset(
    card,
    clamp(currentX, bounds.minX, bounds.maxX),
    clamp(currentY, bounds.minY, bounds.maxY)
  );
};

const initDraggableSkills = () => {
  if (!skillGallery || !skillCards.length) {
    return;
  }

  skillCards.forEach((card) => setSkillOffset(card, Number(card.dataset.dragX || 0), Number(card.dataset.dragY || 0)));

  let activeCard = null;
  let activePointerId = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startX = 0;
  let startY = 0;
  let activeBounds = null;

  const releaseActiveCard = () => {
    if (!activeCard) {
      return;
    }

    clampSkillOffset(activeCard);
    activeCard.classList.remove("is-dragging");
    activeCard.style.removeProperty("z-index");
    activeCard = null;
    activePointerId = null;
    activeBounds = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
  };

  const handlePointerMove = (event) => {
    if (!activeCard || event.pointerId !== activePointerId || !activeBounds) {
      return;
    }

    const nextX = clamp(startX + event.clientX - startPointerX, activeBounds.minX, activeBounds.maxX);
    const nextY = clamp(startY + event.clientY - startPointerY, activeBounds.minY, activeBounds.maxY);
    setSkillOffset(activeCard, nextX, nextY);
  };

  const handlePointerUp = (event) => {
    if (activePointerId !== null && event.pointerId !== activePointerId) {
      return;
    }

    releaseActiveCard();
  };

  skillCards.forEach((card) => {
    card.addEventListener("dragstart", (event) => event.preventDefault());
    card.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const bounds = getSkillBounds(card);
      if (!bounds) {
        return;
      }

      releaseActiveCard();
      activeCard = card;
      activePointerId = event.pointerId;
      activeBounds = bounds;
      startPointerX = event.clientX;
      startPointerY = event.clientY;
      startX = Number(card.dataset.dragX || 0);
      startY = Number(card.dataset.dragY || 0);

      card.classList.add("is-dragging");
      card.style.zIndex = "5";
      card.setPointerCapture?.(event.pointerId);
      event.preventDefault();

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    });
  });

  let resizeFrame = null;
  const reflowSkillCards = () => {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(() => {
      skillCards.forEach((card) => clampSkillOffset(card));
      resizeFrame = null;
    });
  };

  window.addEventListener("resize", reflowSkillCards);
  window.requestAnimationFrame(() => {
    skillCards.forEach((card) => clampSkillOffset(card));
  });
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
initDraggableSkills();
