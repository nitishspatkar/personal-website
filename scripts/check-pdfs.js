/**
 * Ensures every /pdfs/… path referenced in content/data/student-projects-years.json
 * and config.yml exists under public/pdfs/ (any subfolder). Exit 1 if any are missing.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PDF_DIR = path.join(ROOT, "public", "pdfs");

function pdfRelPathsOnDisk() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error("Missing directory:", PDF_DIR);
    process.exit(1);
  }
  const set = new Set();
  function walk(dir, relBase) {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, name.name);
      const rel = relBase ? `${relBase}/${name.name}` : name.name;
      if (name.isDirectory()) {
        walk(full, rel);
      } else if (name.name.endsWith(".pdf")) {
        set.add(rel.replace(/\\/g, "/"));
      }
    }
  }
  walk(PDF_DIR, "");
  return set;
}

function refsFromStudentProjects() {
  const p = path.join(ROOT, "content", "data", "student-projects-years.json");
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const refs = [];
  for (const year of Object.keys(data)) {
    for (const e of data[year]) {
      if (e.pdf && e.pdf.startsWith("/pdfs/")) {
        refs.push(e.pdf.replace(/^\/pdfs\//, ""));
      }
    }
  }
  return refs;
}

function refsFromConfig() {
  const yaml = require("js-yaml");
  const cfg = yaml.load(
    fs.readFileSync(path.join(ROOT, "config.yml"), "utf8")
  );
  const refs = [];
  for (const d of cfg.params?.cvDownloads || []) {
    if (d?.url && d.url.startsWith("/pdfs/")) {
      refs.push(d.url.replace(/^\/pdfs\//, ""));
    }
  }
  const cv = cfg.params?.cvPdfUrl;
  if (cv && cv.startsWith("/pdfs/")) refs.push(cv.replace(/^\/pdfs\//, ""));
  for (const s of cfg.params?.socialIcons || []) {
    const u = s.url;
    if (u && u.startsWith("/pdfs/")) refs.push(u.replace(/^\/pdfs\//, ""));
  }
  return refs;
}

const onDisk = pdfRelPathsOnDisk();
const needed = [...new Set([...refsFromStudentProjects(), ...refsFromConfig()])];
const missing = needed.filter((f) => !onDisk.has(f));

if (missing.length) {
  console.error("PDF referenced but not found under public/pdfs/:");
  for (const f of missing.sort()) console.error(" ", f);
  process.exit(1);
}

console.log(
  "OK:",
  needed.length,
  "local PDF path(s) checked under public/pdfs/"
);
