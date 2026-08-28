#!/usr/bin/env node
// Fails CI if any fenced code block in pages/**/*.mdx is missing from
// public/llms-full.txt. The recent sync PR (#34) added ~280 lines of
// drift that had accumulated unnoticed — this guard exists so it can't
// happen again.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'pages');
const LLMS_FULL_PATH = join(ROOT, 'public', 'llms-full.txt');

// MDX pages whose content is intentionally not mirrored into llms-full.txt.
// Adding to this list is a strong signal — prefer syncing the content instead.
const EXCLUDED_PAGES = new Set([
  'index.mdx',            // marketing landing page (stripped-down examples)
  'sdk/installation.mdx', // SDK docs live outside the API spec
  'sdk/typescript.mdx',
  'sdk/nextjs.mdx',
  'sdk/cli.mdx',
]);

function walkMdx(dir, base = '') {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    if (entry.startsWith('_')) continue; // _meta.ts, _app.tsx
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(full).isDirectory()) {
      out.push(...walkMdx(full, rel));
    } else if (entry.endsWith('.mdx')) {
      out.push({ rel, full });
    }
  }
  return out;
}

function extractCodeBlocks(source) {
  const blocks = [];
  const lines = source.split('\n');
  let inBlock = false;
  let blockStartLine = 0;
  let blockLang = '';
  let blockLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = /^```(.*)$/.exec(line);
    if (fenceMatch) {
      if (!inBlock) {
        inBlock = true;
        blockStartLine = i + 1;
        blockLang = fenceMatch[1].trim();
        blockLines = [];
      } else {
        inBlock = false;
        blocks.push({ startLine: blockStartLine, lang: blockLang, body: blockLines.join('\n') });
      }
    } else if (inBlock) {
      blockLines.push(line);
    }
  }
  return blocks;
}

function normalize(text) {
  return text.split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n');
}

const llmsFull = normalize(readFileSync(LLMS_FULL_PATH, 'utf8'));

const issues = [];
let totalBlocks = 0;
let checkedFiles = 0;

for (const { rel, full } of walkMdx(PAGES_DIR)) {
  if (EXCLUDED_PAGES.has(rel)) continue;
  checkedFiles++;
  const source = readFileSync(full, 'utf8');
  for (const block of extractCodeBlocks(source)) {
    if (!block.body.trim()) continue;
    totalBlocks++;
    const needle = normalize(block.body);
    if (!llmsFull.includes(needle)) {
      issues.push({ file: `pages/${rel}`, line: block.startLine, lang: block.lang, body: block.body });
    }
  }
}

if (issues.length > 0) {
  console.error('');
  console.error(`LLMS DRIFT DETECTED: ${issues.length} of ${totalBlocks} code block(s) in MDX pages are missing from public/llms-full.txt.`);
  console.error('');
  console.error('public/llms-full.txt is the machine-readable spec consumed by LLMs. When you change');
  console.error('an MDX page under pages/, the same code blocks must appear in llms-full.txt.');
  console.error('');
  console.error('To fix:');
  console.error('  1. Copy each missing block into the matching section of public/llms-full.txt, OR');
  console.error('  2. If a page is intentionally outside the spec, add it to EXCLUDED_PAGES in');
  console.error('     scripts/check-llms-drift.mjs (prefer option 1).');
  console.error('');
  console.error('Missing blocks:');
  console.error('');
  for (const issue of issues) {
    const preview = issue.body.split('\n').slice(0, 4);
    const more = issue.body.split('\n').length - preview.length;
    console.error(`  ${issue.file}:${issue.line}  \`\`\`${issue.lang}`);
    for (const line of preview) {
      console.error(`    ${line}`);
    }
    if (more > 0) console.error(`    ... (${more} more line${more === 1 ? '' : 's'})`);
    console.error('');
  }
  process.exit(1);
}

console.log(`llms-full.txt is in sync with MDX pages (${totalBlocks} code blocks checked across ${checkedFiles} files).`);
