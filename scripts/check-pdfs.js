/**
 * Ensures every /pdfs/*.pdf referenced in content/data/student-projects-years.json
 * and config.yml exists under public/pdfs/. Exit 1 if any are missing.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PDF_DIR = path.join(ROOT, "public", "pdfs");

function pdfNamesOnDisk() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error("Missing directory:", PDF_DIR);
    process.exit(1);
  }
  return new Set(
    fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf"))
  );
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
  const cv = cfg.params?.cvPdfUrl;
  if (cv && cv.startsWith("/pdfs/")) refs.push(cv.replace(/^\/pdfs\//, ""));
  for (const s of cfg.params?.socialIcons || []) {
    const u = s.url;
    if (u && u.startsWith("/pdfs/")) refs.push(u.replace(/^\/pdfs\//, ""));
  }
  return refs;
}

const onDisk = pdfNamesOnDisk();
const needed = [...new Set([...refsFromStudentProjects(), ...refsFromConfig()])];
const missing = needed.filter((f) => !onDisk.has(f));

if (missing.length) {
  console.error("PDF referenced but not found in public/pdfs/:");
  for (const f of missing.sort()) console.error(" ", f);
  process.exit(1);
}

console.log(
  "OK:",
  needed.length,
  "local PDF path(s) checked under public/pdfs/"
);
