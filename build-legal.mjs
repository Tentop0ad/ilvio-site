// One-time generator: appdev/legal/*.md -> site/<slug>/index.html
import { marked } from "marked";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Repo root derived from this file's own location (site/build-legal.mjs), so the
// script works on all three machines and from any cwd. Was a hardcoded absolute
// path, which broke for everyone but the person who wrote it.
const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const legal = join(repo, "appdev/legal");
const site = join(repo, "site");

const docs = [
  { md: "privacy_policy.md", slug: "privacy", title: "Privacy Policy" },
  { md: "terms_of_service.md", slug: "terms", title: "Terms of Service" },
  { md: "eula.md", slug: "eula", title: "End User License Agreement" },
  { md: "account_deletion.md", slug: "delete-account", title: "Account Deletion" },
];

marked.setOptions({ gfm: true });

const shell = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — ILVIO</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,200;6..72,300;6..72,400&family=Red+Hat+Text:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">ILVIO</a>
    <nav>
      <a href="/">Home</a>
      <a href="/plans/">Plans</a>
    </nav>
  </header>

  <main class="legal-doc">
${body}
  </main>

  <footer class="site-footer">
    <nav>
      <a href="/plans/">Plans</a>
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <a href="/eula/">EULA</a>
      <a href="/delete-account/">Delete account</a>
    </nav>
    <p class="org">© 2026 ILVIO OÜ · Tallinn, Estonia</p>
    <p class="mail"><a href="mailto:info@ilvio.eu">info@ilvio.eu</a></p>
  </footer>
</body>
</html>
`;

for (const { md, slug, title } of docs) {
  let src = readFileSync(join(legal, md), "utf8");
  // Strip internal-only sections and HTML comments from the public build.
  src = src.split(/\n## Implementation reference/)[0];
  src = src.replace(/<!--[\s\S]*?-->/g, "");
  let html = marked.parse(src);
  // Horizontal-scroll wrapper so wide tables don't break the page on phones.
  html = html
    .replaceAll("<table>", '<div class="table-scroll"><table>')
    .replaceAll("</table>", "</table></div>");
  const outDir = join(site, slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), shell(title, html));
  console.log(`${slug}/index.html written (${html.length} bytes of body)`);
}
