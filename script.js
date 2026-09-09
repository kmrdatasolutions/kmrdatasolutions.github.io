const C = SITE_CONFIG;

document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

const currentPage = document.body.dataset.page;
document.querySelectorAll("[data-nav]").forEach(a => {
  if (a.dataset.nav === currentPage) a.classList.add("active");
});

const menu = document.querySelector(".menu-btn");
const links = document.querySelector(".nav-links");
if (menu && links) {
  menu.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }));
}


function serviceCard(s) {
  return `<article class="service">
    <div class="icon">${s.icon}</div>
    <h3>${s.title}</h3>
    <p>${s.text}</p>
    <a href="contact.html">Discuss this service →</a>
  </article>`;
}
function projectCard(p, i) {
  const name = (p.name || "Untitled project").replace(/[-_]/g, " ");
  const desc = p.description || "GitHub project by KMR Data Solutions.";
  const language = p.language || "Project";
  return `<article class="project">
    <div class="project-top"><span class="num">PROJECT ${String(i + 1).padStart(2,"0")}</span><span class="repo-type">${p.fork ? "Fork" : "Public"}</span></div>
    <h3>${escapeHtml(name)}</h3>
    <p>${escapeHtml(desc)}</p>
    <div class="tags"><span class="tag">${escapeHtml(language)}</span>${(p.topics || []).slice(0,3).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
    <div class="project-meta"><span>★ ${p.stargazers_count || 0}</span><span>Updated ${formatDate(p.updated_at)}</span></div>
    <a href="${p.html_url}" target="_blank" rel="noopener">View on GitHub ↗</a>
  </article>`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function formatDate(date) {
  if (!date) return "recently";
  return new Date(date).toLocaleDateString(undefined, {month:"short", year:"numeric"});
}

const sg = document.getElementById("servicesGrid");
if (sg) sg.innerHTML = C.services.map(serviceCard).join("");
const hsg = document.getElementById("homeServices");
if (hsg) {
  const homeServiceTitles = ["Data Analysis", "Data Visualization", "Business Insights", "Dashboard Development"];
  hsg.innerHTML = C.services.filter(service => homeServiceTitles.includes(service.title)).map(serviceCard).join("");
}

const sk = document.getElementById("skillsGrid");
if (sk) sk.innerHTML = C.skills.map(s => `<div class="skill"><b class="skill-icon">${s[0]}</b><span>${s[1]}</span></div>`).join("");

const pr = document.getElementById("processGrid");
if (pr) pr.innerHTML = C.process.map(s => `<article class="step"><b>${s[0]}</b><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join("");

const eb = document.getElementById("emailBtn");
const emailText = document.getElementById("emailText");
if (eb) eb.href = `mailto:${C.email}`;
if (emailText) emailText.textContent = C.email;

const wb = document.getElementById("whatsappBtn");
if (wb) {
  const cleanWhatsApp = (C.whatsapp || "").replace(/\D/g, "");
  if (cleanWhatsApp && !cleanWhatsApp.endsWith("0000000000")) {
    wb.href = `https://wa.me/${cleanWhatsApp}`;
  } else {
    wb.href = `mailto:${C.email}`;
    wb.querySelector("span").textContent = "Add your WhatsApp number in config.js";
  }
}
const ghc = document.getElementById("githubContact");
if (ghc) ghc.href = C.githubProfile;

let allRepos = [];

async function fetchAllGithubRepos() {
  // Fetch every public repository page, rather than limiting the API call to 6.
  // GitHub returns up to 100 items per page.
  const repos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/users/${encodeURIComponent(C.githubUsername)}/repos?type=all&sort=updated&per_page=100&page=${page}`;
    const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const batch = await response.json();
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return repos;
}

function populateLanguageFilter(repos) {
  const select = document.getElementById("languageFilter");
  if (!select) return;
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
  select.innerHTML = `<option value="">All Languages</option>` + langs.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join("");
}

function renderProjects() {
  const target = document.getElementById("projectsGrid");
  if (!target) return;

  const search = (document.getElementById("projectSearch")?.value || "").toLowerCase().trim();
  const lang = document.getElementById("languageFilter")?.value || "";
  const sort = document.getElementById("sortProjects")?.value || "updated";

  let filtered = allRepos.filter(repo => {
    const haystack = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
    return (!search || haystack.includes(search)) && (!lang || repo.language === lang);
  });

  filtered.sort((a,b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "stars") return (b.stargazers_count || 0) - (a.stargazers_count || 0);
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  target.innerHTML = filtered.map(projectCard).join("");
  document.getElementById("projectsEmpty")?.toggleAttribute("hidden", filtered.length !== 0);
  const status = document.getElementById("projectsStatus");
  if (status) status.textContent = `${filtered.length} of ${allRepos.length} public repositories shown`;
}

async function githubProjects() {
  const target = document.getElementById("projectsGrid");
  const homeTarget = document.getElementById("homeProjects");
  const repoCount = document.getElementById("repoCount");
  if (!target && !homeTarget && !repoCount) return;

  try {
    allRepos = await fetchAllGithubRepos();
    if (repoCount) repoCount.textContent = allRepos.length;
    populateLanguageFilter(allRepos);
    if (target) renderProjects();
    if (homeTarget) homeTarget.innerHTML = [...allRepos].sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0,3).map(projectCard).join("");
  } catch (error) {
    if (target) {
      target.innerHTML = `<div class="error-card"><strong>GitHub projects could not be loaded right now.</strong><span>Please refresh the page or open the GitHub profile directly.</span><a href="${C.githubProfile}" target="_blank" rel="noopener">Open GitHub ↗</a></div>`;
      const status = document.getElementById("projectsStatus");
      if (status) status.textContent = "GitHub sync unavailable";
    }
  }
}

["projectSearch","languageFilter","sortProjects"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", renderProjects);
  document.getElementById(id)?.addEventListener("change", renderProjects);
});

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    const subject = encodeURIComponent(`Website enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${C.email}?subject=${subject}&body=${body}`;
  });
}

githubProjects();
