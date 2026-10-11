const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : []);
}
const phrases = new Set(fs.existsSync('src/lib/i18n/source-phrases.json') ? JSON.parse(fs.readFileSync('src/lib/i18n/source-phrases.json', 'utf8')) : []);
const normalize = s => s.replace(/\s+/g, ' ').trim();
for (const file of files('src')) {
  if (file.includes(`${path.sep}generated${path.sep}`) || file.includes(`${path.sep}i18n${path.sep}`) || file.includes(`${path.sep}api${path.sep}`) || file.includes(`${path.sep}lib${path.sep}explore${path.sep}`) || file.includes(`${path.sep}assistant${path.sep}ai${path.sep}`)) continue;
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function visit(n) {
    if (ts.isJsxText(n)) {
      const text = normalize(n.text);
      if (/[\p{L}]/u.test(text)) phrases.add(text);
    }
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const text = normalize(n.text);
      const p = n.parent;
      const display = ts.isPropertyAssignment(p) && /^(label|title|description|subtitle|message|placeholder|text|name|statusLabel|hint|error|content|badge|tag|caption|helperText|emptyText|labelTr|nameTr|descTr)$/.test(p.name.getText(source));
      const attr = ts.isJsxAttribute(p) && /^(title|placeholder|aria-label|alt|label|description)$/.test(p.name.text);
      const localized = ts.isCallExpression(p) && p.expression.getText(source) === 'localizeText';
      let ancestor = p;
      while (ancestor && !ts.isJsxExpression(ancestor) && !ts.isStatement(ancestor)) ancestor = ancestor.parent;
      const jsxCopy = ancestor && ts.isJsxExpression(ancestor) && (ts.isJsxExpression(p) || (ts.isConditionalExpression(p) && (p.whenTrue === n || p.whenFalse === n))) && (!ts.isJsxAttribute(ancestor.parent) || /^(title|placeholder|aria-label|alt|label|description|subtitle|helperText|error|actionLabel)$/.test(ancestor.parent.name.getText(source)));
      if ((/[çğıöşüÇĞİÖŞÜ]/.test(text) || display || attr || localized || jsxCopy) && /\p{L}/u.test(text) && !text.includes('://') && !text.includes('className') && !/^[a-z]+(?:-[a-z\d/:.]+)+$/.test(text)) phrases.add(text);
    }
    if (ts.isTemplateExpression(n)) {
      if (ts.isVariableDeclaration(n.parent) && /systemPrompt/.test(n.parent.name.getText(source))) return;
      const text = normalize(n.head.text + n.templateSpans.map((s, i) => `{${i}}${s.literal.text}`).join(''));
      if (/[çğıöşüÇĞİÖŞÜ]/.test(text) || (ts.isCallExpression(n.parent) && n.parent.expression.getText(source) === 'localizeText' && /[\p{L}]/u.test(text))) phrases.add(text);
    }
    ts.forEachChild(n, visit);
  }
  visit(source);
}
const uiPhrases = [...phrases].filter(phrase => !phrase.startsWith('Sen LifeOS Asistanısın. Nazik'));
fs.writeFileSync('src/lib/i18n/source-phrases.json', JSON.stringify(uiPhrases.sort(), null, 2) + '\n');
console.log(`${phrases.size} source phrases`);
