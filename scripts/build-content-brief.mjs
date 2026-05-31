/**
 * Build KOMMUNITI_CONTENT_CREATOR_BRIEF.tex and .pdf.
 *
 * Source (optional, internal): scripts/content-brief.source.md
 * Deliverables (share with creators): docs/KOMMUNITI_CONTENT_CREATOR_BRIEF.tex + .pdf
 *
 * To edit: update the .tex file directly, or maintain source markdown in scripts/
 * and run: npm run build:content-brief
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const docsDir = path.join(root, "docs");
const baseName = "KOMMUNITI_CONTENT_CREATOR_BRIEF";
const sourceMdPath = path.join(root, "scripts", "content-brief.source.md");
const mdPath = fs.existsSync(sourceMdPath) ? sourceMdPath : path.join(docsDir, `${baseName}.md`);
const texPath = path.join(docsDir, `${baseName}.tex`);
const pdfPath = path.join(docsDir, `${baseName}.pdf`);
const cssPath = path.join(docsDir, "content-brief-print.css");

function escapeLatex(text) {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function inlineFormat(text) {
  const codeSlots = [];
  let out = text.replace(/`([^`]+)`/g, (_, m) => {
    codeSlots.push(`\\texttt{${escapeLatex(m)}}`);
    return `\x00C${codeSlots.length - 1}\x00`;
  });
  out = escapeLatex(out);
  out = out.replace(/\*\*(.+?)\*\*/g, (_, m) => `\\textbf{${m}}`);
  out = out.replace(/\*(.+?)\*/g, (_, m) => `\\textit{${m}}`);
  out = out.replace(/\x00C(\d+)\x00/g, (_, i) => codeSlots[Number(i)]);
  out = out.replace(/→/g, "$\\rightarrow$");
  out = out.replace(/—/g, "---");
  out = out.replace(/–/g, "--");
  out = out.replace(/🪙/g, "(KO Coin)");
  return out;
}

function parseTable(lines, startIdx) {
  const rows = [];
  let i = startIdx;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    const row = lines[i]
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
    if (!row.every((c) => /^[-:\s]+$/.test(c))) {
      rows.push(row);
    }
    i++;
  }
  return { rows, nextIdx: i };
}

function tableToLatex(rows) {
  if (rows.length === 0) return "";
  const cols = rows[0].length;
  const colSpec = "l".repeat(cols);
  const body = rows
    .map((row, ri) => {
      const cells = row.map((c) => inlineFormat(c)).join(" & ");
      return `${cells}${ri < rows.length - 1 ? " \\\\ \\hline" : " \\\\"}`;
    })
    .join("\n");
  return `\\begin{longtable}{|${colSpec.split("").join("|")}|}
\\hline
${body}
\\hline
\\end{longtable}`;
}

function mdToLatex(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let inCode = false;
  let codeLines = [];
  let inList = false;
  let listType = null;

  const closeList = () => {
    if (inList) {
      out.push(listType === "ol" ? "\\end{enumerate}" : "\\end{itemize}");
      inList = false;
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      closeList();
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        inCode = false;
        out.push("\\begin{verbatim}");
        out.push(...codeLines);
        out.push("\\end{verbatim}");
        codeLines = [];
      }
      i++;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (trimmed.startsWith("|")) {
      closeList();
      const { rows, nextIdx } = parseTable(lines, i);
      out.push(tableToLatex(rows));
      out.push("");
      i = nextIdx;
      continue;
    }

    if (trimmed === "---") {
      closeList();
      out.push("\\medskip\\hrule\\medskip");
      i++;
      continue;
    }

    const h1 = trimmed.match(/^# (.+)$/);
    const h2 = trimmed.match(/^## (.+)$/);
    const h3 = trimmed.match(/^### (.+)$/);
    const h4 = trimmed.match(/^#### (.+)$/);
    const ul = trimmed.match(/^- (.+)$/);
    const ol = trimmed.match(/^\d+\. (.+)$/);

    if (h1) {
      closeList();
      out.push(`\\section{${inlineFormat(h1[1])}}`);
      i++;
      continue;
    }
    if (h2) {
      closeList();
      out.push(`\\subsection{${inlineFormat(h2[1])}}`);
      i++;
      continue;
    }
    if (h3) {
      closeList();
      out.push(`\\subsubsection{${inlineFormat(h3[1])}}`);
      i++;
      continue;
    }
    if (h4) {
      closeList();
      out.push(`\\paragraph{${inlineFormat(h4[1])}}`);
      i++;
      continue;
    }

    if (ul) {
      if (!inList || listType !== "ul") {
        closeList();
        out.push("\\begin{itemize}");
        inList = true;
        listType = "ul";
      }
      out.push(`  \\item ${inlineFormat(ul[1])}`);
      i++;
      continue;
    }

    if (ol) {
      if (!inList || listType !== "ol") {
        closeList();
        out.push("\\begin{enumerate}");
        inList = true;
        listType = "ol";
      }
      out.push(`  \\item ${inlineFormat(ol[1])}`);
      i++;
      continue;
    }

    if (trimmed === "") {
      closeList();
      out.push("");
      i++;
      continue;
    }

    if (trimmed.startsWith("*End of")) {
      closeList();
      out.push(`\\textit{${inlineFormat(trimmed.replace(/^\*|\*$/g, ""))}}`);
      i++;
      continue;
    }

    closeList();
    out.push(inlineFormat(trimmed));
    out.push("");
    i++;
  }

  closeList();
  return out.join("\n");
}

const preamble = String.raw`\documentclass[11pt,a4paper]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=2.2cm,headheight=14pt]{geometry}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{array}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{parskip}
\usepackage{enumitem}

\definecolor{KommOrange}{HTML}{FF6B35}
\definecolor{KommPurple}{HTML}{C77DFF}
\definecolor{KommNavy}{HTML}{0B1828}
\definecolor{KommGold}{HTML}{C9A84C}

\hypersetup{
  colorlinks=true,
  linkcolor=KommOrange,
  urlcolor=KommPurple,
  pdftitle={Kommuniti Content Creator Brief},
  pdfauthor={Kommuniti}
}

\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\small Kommuniti Content Creator Brief}
\fancyhead[R]{\small May 2026}
\fancyfoot[C]{\thepage}

\titleformat{\section}{\Large\bfseries\color{KommNavy}}{}{0em}{}
\titleformat{\subsection}{\large\bfseries\color{KommOrange}}{}{0em}{}
\titleformat{\subsubsection}{\normalsize\bfseries\color{KommPurple}}{}{0em}{}

\newcommand{\emoji}[1]{}

\begin{document}

\begin{titlepage}
  \centering
  \vspace*{2cm}
  {\Huge\bfseries\color{KommNavy} Kommuniti Content Creator Brief\par}
  \vspace{1.2cm}
  {\Large Part I: KO Reads \textbar{} Part II: Konnect\par}
  \vspace{0.8cm}
  {\large For designers, videographers, copywriters, and social media creators\par}
  \vfill
  {\color{KommGold}\rule{0.6\textwidth}{1pt}\par}
  \vspace{0.5cm}
  {\small Phase 1 live products \textbar{} May 2026\par}
\end{titlepage}

\tableofcontents
\newpage

`;

const postamble = "\n\\end{document}\n";

if (!fs.existsSync(mdPath)) {
  console.error(`Missing source: ${mdPath}`);
  process.exit(1);
}

const md = fs.readFileSync(mdPath, "utf8");
const body = mdToLatex(md);
fs.writeFileSync(texPath, preamble + body + postamble, "utf8");
console.log(`Wrote ${texPath}`);

if (!fs.existsSync(cssPath)) {
  fs.writeFileSync(
    cssPath,
    `body {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #1a1a1a;
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem;
}
h1 { color: #0B1828; border-bottom: 2px solid #FF6B35; padding-bottom: 0.3em; page-break-before: always; }
h1:first-of-type { page-break-before: avoid; }
h2 { color: #FF6B35; margin-top: 1.5em; }
h3 { color: #C77DFF; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; }
th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background: #0B1828; color: #F0E8D5; }
code, pre { font-family: Consolas, monospace; font-size: 9pt; background: #f4f4f4; }
pre { padding: 12px; overflow-x: auto; white-space: pre-wrap; }
hr { border: none; border-top: 1px solid #C9A84C; margin: 2em 0; }
strong { color: #0B1828; }
@media print {
  h1, h2, h3 { page-break-after: avoid; }
  table, pre { page-break-inside: avoid; }
}
`,
    "utf8"
  );
}

async function buildPdf() {
  const chromePaths = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ];
  const executablePath = chromePaths.find((p) => fs.existsSync(p));
  if (!executablePath) {
    console.warn("PDF skipped: Chrome/Edge not found.");
    return;
  }

  const css = fs.readFileSync(cssPath, "utf8");
  const htmlBody = marked.parse(md);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Kommuniti Content Creator Brief</title>
  <style>${css}</style>
</head>
<body>${htmlBody}</body>
</html>`;

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
}

await buildPdf();
