/**
 * Renders all routes to ./dist for static hosts (e.g. GitHub Pages).
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { app, innovationProjects } = require("../server.js");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PUBLIC = path.join(ROOT, "public");

function destPathForUrl(u) {
  if (u === "/") return "index.html";
  if (u === "/sitemap.xml") return "sitemap.xml";
  return `${u.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
}

function collectUrls() {
  const urls = [
    "/",
    "/research/",
    "/student-projects/",
    "/work_experiences/",
    "/short_bio/",
    "/innovation-projects/",
    "/sitemap.xml",
    ...innovationProjects().map((p) => `/innovation-projects/${p.slug}/`),
  ];
  return urls;
}

function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: urlPath,
        method: "GET",
        headers: { Host: "localhost" },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            body: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  fs.mkdirSync(DIST, { recursive: true });
  if (fs.existsSync(PUBLIC)) {
    fs.cpSync(PUBLIC, DIST, { recursive: true });
  }

  const server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", (err) => (err ? reject(err) : resolve()));
  });
  const port = server.address().port;

  try {
    for (const u of collectUrls()) {
      const { status, body } = await get(port, u);
      if (status !== 200) {
        throw new Error(`GET ${u} -> ${status}`);
      }
      const rel = destPathForUrl(u);
      const full = path.join(DIST, rel);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, body);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`Static site written to ${DIST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
