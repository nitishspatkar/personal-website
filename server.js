/**
 * Simple Express site: pages in ./content (Markdown + ./content/data for YAML/JSON),
 * config from ./config.yml, static files from ./public
 */
const path = require("path");
const fs = require("fs");
const http = require("http");
const express = require("express");
const ejs = require("ejs");
const yaml = require("js-yaml");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content");
const CONTENT_DATA = path.join(CONTENT, "data");
const PUBLIC = path.join(ROOT, "public");
const VIEWS = path.join(ROOT, "views");

const app = express();
app.set("strict routing", true);
app.set("views", VIEWS);
app.set("view engine", "ejs");

let site;
try {
  site = yaml.load(fs.readFileSync(path.join(ROOT, "config.yml"), "utf8"));
} catch (e) {
  console.error("Failed to read config.yml:", e.message);
  process.exit(1);
}

const baseURL = (site.baseURL || "http://localhost:3000/").replace(/\/?$/, "/");
const navItems = [...(site.menu?.main || [])].sort(
  (a, b) => (a.weight || 0) - (b.weight || 0)
);
const profile = site.params?.profileMode || {};
/** Default meta description when a route or markdown file does not set one. */
const defaultMetaDescription =
  site.params?.description || profile.subtitle || undefined;
const socialIcons = site.params?.socialIcons || [];
const gaId = site.params?.GoogleAnalyticsID;
const cvPdfUrl = site.params?.cvPdfUrl || "/pdfs/Patkar_cv_En.pdf";

function loadCv() {
  try {
    return yaml.load(fs.readFileSync(path.join(CONTENT_DATA, "cv.yml"), "utf8"));
  } catch (e) {
    console.warn("Optional content/data/cv.yml missing or invalid:", e.message);
    return {};
  }
}

function loadResearchProjects() {
  try {
    return yaml.load(
      fs.readFileSync(path.join(CONTENT_DATA, "research-projects.yml"), "utf8")
    );
  } catch (e) {
    console.warn("content/data/research-projects.yml:", e.message);
    return {
      title: "Research Projects",
      project_blocks: [],
    };
  }
}

function loadTeachingSupervision() {
  try {
    const data = yaml.load(
      fs.readFileSync(path.join(CONTENT_DATA, "teaching-supervision.yml"), "utf8")
    );
    const jsonPath = path.join(CONTENT_DATA, "student-projects-years.json");
    let studentYears = {};
    if (fs.existsSync(jsonPath)) {
      studentYears = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    }
    const yearOrder = Object.keys(studentYears).sort(
      (a, b) => Number(b) - Number(a)
    );
    return { ...data, studentYears, yearOrder };
  } catch (e) {
    console.warn(
      "content/data/teaching-supervision.yml or student-projects-years.json:",
      e.message
    );
    return {
      title: "Teaching and supervision",
      stats: [],
      teaching_blocks: [],
      studentYears: {},
      yearOrder: [],
    };
  }
}

function normalizeCommunityServiceItems(items) {
  if (!items || !items.length) return [];
  return items.map((item) => {
    if (typeof item === "string") return { text: item };
    if (item && item.md) return { html: marked.parseInline(item.md) };
    if (item && item.html) return { html: item.html };
    if (item && item.text != null) return { text: item.text };
    return { text: String(item) };
  });
}

function loadCommunityService() {
  try {
    const raw = yaml.load(
      fs.readFileSync(path.join(CONTENT_DATA, "community-service.yml"), "utf8")
    );
    const sections = (raw.sections || []).map((sec) => ({
      ...sec,
      items: normalizeCommunityServiceItems(sec.items),
    }));
    return { ...raw, sections };
  } catch (e) {
    console.warn("content/data/community-service.yml:", e.message);
    return {
      title: "Community Service",
      intro: "",
      sections: [],
    };
  }
}

/** Ensures internal menu URLs match Express routes (trailing slash). */
function navHref(itemUrl) {
  let s = String(itemUrl || "").replace(/^\//, "");
  if (!s.endsWith("/")) s += "/";
  return "/" + s;
}

function readMarkdown(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { data, content, html: marked.parse(content) };
}

/** Body of short_bio.md as HTML (strips the section heading). */
function shortBioBodyHtml() {
  const p = path.join(CONTENT, "short_bio.md");
  if (!fs.existsSync(p)) return "";
  const raw = fs.readFileSync(p, "utf8");
  const { content } = matter(raw);
  const cleaned = content.replace(/^###\s*Short Biography\s*\n*/i, "").trim();
  return cleaned ? marked.parse(cleaned) : "";
}

function safeSlug(s) {
  return typeof s === "string" && /^[a-z0-9][a-z0-9_-]*$/i.test(s);
}

function innovationProjects() {
  const dir = path.join(CONTENT, "innovation-projects");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const items = [];
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const full = path.join(dir, f);
    const { data, content } = matter(fs.readFileSync(full, "utf8"));
    items.push({
      slug,
      title: data.title || slug,
      summary: data.summary || "",
      cover: data.cover || null,
      tags: data.tags || [],
      date: data.date,
    });
  }
  items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return items;
}

function renderPage(res, view, locals) {
  res.render(view, {
    siteTitle: site.title,
    navItems,
    baseURL,
    gaId,
    navHref,
    socialIcons,
    cvPdfUrl,
    ...locals,
    isHome: locals.path === "/",
  });
}

function render404(res, req) {
  return res.status(404).render("404", {
    siteTitle: site.title,
    navItems,
    baseURL,
    gaId,
    navHref,
    socialIcons,
    cvPdfUrl,
    title: "Not found",
    path: req.path,
  });
}

app.get("/student-projects/", (req, res) => {
  const teaching = loadTeachingSupervision();
  renderPage(res, "teaching-supervision", {
    title: teaching.title || "Teaching and supervision",
    description: teaching.description || defaultMetaDescription,
    teaching,
    path: "/student-projects/",
  });
});

app.get("/research/", (req, res) => {
  const community = loadCommunityService();
  renderPage(res, "community-service", {
    title: community.title || "Community Service",
    description: community.description || defaultMetaDescription,
    community,
    path: "/research/",
  });
});

app.get("/", (req, res) => {
  let heroNarrativeHtml = "";
  try {
    heroNarrativeHtml = shortBioBodyHtml();
  } catch {
    /* optional */
  }
  renderPage(res, "home", {
    title: site.title,
    description: defaultMetaDescription,
    profile,
    heroNarrativeHtml,
    cv: loadCv(),
    path: "/",
  });
});

const pageRoutes = [
  ["random/", "random/index.md", "Random"],
  ["work_experiences/", "work_experiences.md", "Work experience"],
  ["short_bio/", "short_bio.md", "Short biography"],
];

const redirectSlugs = [
  "research",
  "student-projects",
  "random",
  "work_experiences",
  "short_bio",
  "innovation-projects",
];
for (const s of redirectSlugs) {
  app.get("/" + s, (req, res) => res.redirect(301, "/" + s + "/"));
}

for (const [urlPath, rel, fallbackTitle] of pageRoutes) {
  app.get("/" + urlPath, (req, res) => {
    const filePath = path.join(CONTENT, rel);
    if (!fs.existsSync(filePath)) {
      return render404(res, req);
    }
    const { data, html } = readMarkdown(filePath);
    renderPage(res, "page", {
      title: data.title || fallbackTitle,
      description: data.description || data.summary || defaultMetaDescription,
      html,
      path: "/" + urlPath,
    });
  });
}

app.get("/innovation-projects/", (req, res) => {
  const research = loadResearchProjects();
  renderPage(res, "research-projects", {
    title: research.title || "Research Projects",
    description: research.description || defaultMetaDescription,
    research,
    path: "/innovation-projects/",
  });
});

app.get("/innovation-projects/:slug", (req, res) => {
  const { slug } = req.params;
  if (!safeSlug(slug)) return res.sendStatus(400);
  return res.redirect(301, `/innovation-projects/${slug}/`);
});

app.get("/innovation-projects/:slug/", (req, res) => {
  const { slug } = req.params;
  if (!safeSlug(slug)) return res.sendStatus(400);
  const filePath = path.join(CONTENT, "innovation-projects", `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return render404(res, req);
  }
  const { data, html } = readMarkdown(filePath);
  renderPage(res, "page", {
    title: data.title || slug,
    description: data.summary || data.description,
    html,
    path: `/innovation-projects/${slug}/`,
  });
});

app.get("/sitemap.xml", (req, res) => {
  const urls = [
    "",
    "research/",
    "innovation-projects/",
    "student-projects/",
    "work_experiences/",
    "short_bio/",
    ...innovationProjects().map((p) => `innovation-projects/${p.slug}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${baseURL}${u}</loc><changefreq>monthly</changefreq></url>`
  )
  .join("\n")}
</urlset>`;
  res.type("application/xml").send(body);
});

app.use(express.static(PUBLIC));

app.use((req, res) => {
  render404(res, req);
});

module.exports = { app, innovationProjects };

if (require.main === module) {
  const preferred = Number(process.env.PORT) || 3000;
  const server = http.createServer(app);
  const explicitPort = Boolean(process.env.PORT);
  const maxTries = explicitPort ? 1 : 30;

  function listenFrom(port, triesLeft) {
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE" && !explicitPort && triesLeft > 1) {
        const next = port + 1;
        console.warn(`Port ${port} is in use, trying ${next}…`);
        listenFrom(next, triesLeft - 1);
      } else {
        console.error(err.message);
        if (err.code === "EADDRINUSE") {
          console.error(
            "Free that port or run with another, e.g. PORT=3001 npm run dev"
          );
        }
        process.exit(1);
      }
    });
    server.listen(port, () => {
      server.removeAllListeners("error");
      console.log(`http://localhost:${port}`);
    });
  }

  listenFrom(preferred, maxTries);
}
