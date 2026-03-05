#!/usr/bin/env node
/**
 * check_text.js — 检查文件中是否存在 LaTeX 行内公式 \( ... \)
 *
 * 从命令行接受一个或多个文件，若任一文件中出现 \( ... \) 形式的行内公式，
 * 则输出详细位置并以退出码 1 结束；否则退出码为 0。
 *
 * Usage:
 *   node check_text.js <file> [file ...]
 */

const fs = require('fs');
const path = require('path');

const filePaths = process.argv.slice(2);

if (filePaths.length === 0) {
  console.error('Usage: node check_text.js <file> [file ...]');
  process.exit(1);
}

// Match \( ... \) — non-greedy, allow newlines
const regex = /\\\(([\s\S]*?)\\\)/g;
let totalCount = 0;

for (const filePath of filePaths) {
  const resolved = path.resolve(filePath);
  let content;
  try {
    content = fs.readFileSync(resolved, 'utf8');
  } catch (err) {
    console.error(`${resolved}: ${err.message}`);
    continue;
  }

  let count = 0;
  let match;
  regex.lastIndex = 0;
  while ((match = regex.exec(content)) !== null) {
    count++;
    const before = content.slice(0, match.index);
    const lineNum = before.split(/\r?\n/).length;
    const snippet = match[1].replace(/\n/g, ' ').trim();
    const display = snippet.length > 60 ? snippet.slice(0, 57) + '...' : snippet;
    console.error(`${resolved}:${lineNum}: inline math \\( ${display} \\)`);
  }

  totalCount += count;
}

if (totalCount > 0) {
  console.error(`Found ${totalCount} occurrence(s) of \\( ... \\) in ${filePaths.length} file(s).`);
  process.exit(1);
} else {
  // no matches; exit code 0
  process.exit(0);
}

