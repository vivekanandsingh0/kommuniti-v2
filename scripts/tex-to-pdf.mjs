/**
 * Render KOMMUNITI_CONTENT_CREATOR_BRIEF.pdf from the .tex file (no markdown required).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const docsDir = path.join(root, "docs");
const texPath = path.join(docsDir, "KOMMUNITI_CONTENT_CREATOR_BRIEF.tex");
const pdfPath = path.join(docsDir, "KOMMUNITI_CONTENT_CREATOR_BRIEF.pdf");
const cssPath = path.join(docsDir, "content-brief-print.css");

function texToHtml(tex) {
  let body = tex
    .replace(/^[\s\S]*?\\begin\{document\}/, "")
    .replace(/\\end\{document\}[\s\S]*$/, "")
    .replace(/\\begin\{titlepage\}[\s\S]*?\\end\{titlepage\}/, "")
    .replace(/\\tableofcontents[\s\S]*?\\newpage/, "");

  body = body.replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g, (_, c) => {
    const escaped = c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre>${escaped.trim()}</pre>`;
  });

  body = body.replace(
    /\\begin\{longtable\}\{[^}]*\}([\s\S]*?)\\end\{longtable\}/g,
    (_, content) => {
      const rows = content
        .split(/\\\\\s*(?:\\hline\s*)?/)
        .map((r) => r.replace(/\\hline/g, "").trim())
        .filter((r) => r && !r.startsWith("\\"));
      const trs = rows
        .map((row, i) => {
          const cells = row.split("&").map((c) => c.trim());
          const tag = i === 0 ? "th" : "td";
          return `<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("")}</tr>`;
        })
        .join("");
      return `<table>${trs}</table>`;
    }
  );

  body = body.replace(/\\section\{([^}]*)\}/g, (_, t) => `<h1>${inline(t)}</h1>`);
  body = body.replace(/\\subsection\{([^}]*)\}/g, (_, t) => `<h2>${inline(t)}</h2>`);
  body = body.replace(/\\subsubsection\{([^}]*)\}/g, (_, t) => `<h3>${inline(t)}</h3>`);
  body = body.replace(/\\paragraph\{([^}]*)\}/g, (_, t) => `<h4>${inline(t)}</h4>`);
  body = body.replace(/\\medskip\\hrule\\medskip/g, "<hr />");
  body = body.replace(/\\begin\{itemize\}/g, "<ul>");
  body = body.replace(/\\end\{itemize\}/g, "</ul>");
  body = body.replace(/\\begin\{enumerate\}/g, "<ol>");
  body = body.replace(/\\end\{enumerate\}/g, "</ol>");
  body = body.replace(/^\s*\\item\s+/gm, "<li>");
  body = body.replace(/<li>([^<]*?)(?=\n(?!<li>)|\n*$)/gm, "<li>$1</li>");

  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => {
      const t = block.trim();
      if (!t) return "";
      if (/^<(h[1-4]|ul|ol|table|pre|hr|li)/.test(t)) return t;
      return `<p>${inline(t.replace(/\n/g, " "))}</p>`;
    })
    .filter(Boolean);

  return `<div class="cover"><h1>Kommuniti Content Creator Brief</h1><p><strong>Part I:</strong> KO Reads &nbsp;·&nbsp; <strong>Part II:</strong> Konnect</p><p>For designers, videographers, copywriters, and social media creators · May 2026</p></div>${paragraphs.join("\n")}`;
}

function inline(text) {
  return text
    .replace(/\\textbf\{([^}]*)\}/g, "<strong>$1</strong>")
    .replace(/\\textit\{([^}]*)\}/g, "<em>$1</em>")
    .replace(/\\texttt\{([^}]*)\}/g, "<code>$1</code>")
    .replace(/\\textbar\{\}/g, "|")
    .replace(/\\rightarrow/g, "→")
    .replace(/---/g, "—")
    .replace(/``([^']*)''/g, '"$1"')
    .replace(/\\&/g, "&")
    .replace(/\\\$/g, "$")
    .replace(/\\#/g, "#")
    .replace(/\\%/g, "%");
}

const css = fs.existsSync(cssPath)
  ? fs.readFileSync(cssPath, "utf8")
  : `body { font-family: Georgia, serif; font-size: 11pt; line-height: 1.55; color: #1a1a1a; max-width: 820px; margin: 0 auto; padding: 2rem; }
.cover { text-align: center; padding: 3rem 0 2rem; border-bottom: 2px solid #C9A84C; margin-bottom: 2rem; page-break-after: always; }
h1 { color: #0B1828; border-bottom: 2px solid #FF6B35; padding-bottom: 0.3em; page-break-before: always; }
.cover h1 { border: none; page-break-before: avoid; }
h2 { color: #FF6B35; margin-top: 1.5em; } h3 { color: #C77DFF; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; }
th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #0B1828; color: #F0E8D5; }
code, pre { font-family: Consolas, monospace; font-size: 9pt; background: #f4f4f4; }
pre { padding: 12px; white-space: pre-wrap; } hr { border: none; border-top: 1px solid #C9A84C; margin: 2em 0; }`;

const tex = fs.readFileSync(texPath, "utf8");
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>Kommuniti Content Creator Brief</title><style>${css}</style></head><body>${texToHtml(tex)}</body></html>`;

const chromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
const executablePath = chromePaths.find((p) => fs.existsSync(p));
if (!executablePath) {
  console.error("Chrome/Edge not found.");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" },
  });
  console.log(`Wrote ${pdfPath}`);
} finally {
  await browser.close();
}
