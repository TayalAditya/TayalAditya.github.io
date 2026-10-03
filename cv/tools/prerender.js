// Writes the project index into index.html as plain HTML, so search engines and link
// previews see every project without running JavaScript. main.js renders the same markup.
// Run after editing js/projects.js:  node cv/tools/prerender.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js', 'projects.js'), 'utf8'), sandbox);
const { CV_PROJECTS: projects, CV_ORDER: order = [] } = sandbox.window;

const rank = (p) => { const i = order.indexOf(p.name); return i === -1 ? order.length : i; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const rows = projects.slice().sort((a, b) => rank(a) - rank(b)).map((p) =>
  '<li class="prow acc" data-cats="' + p.cats + '">' +
  '<button class="prow__head acc__trigger" type="button" aria-expanded="false">' +
  '<span class="prow__y mono">' + p.y + '</span><span class="prow__name">' + esc(p.name) + '</span>' +
  '<span class="prow__ctx mono">' + esc(p.ctx) + '</span><span class="prow__arrow" aria-hidden="true">→</span></button>' +
  '<div class="acc__body"><div class="acc__inner"><div class="prow__body"><div class="prow__text"><p class="prow__desc">' + esc(p.desc) + '</p>' +
  '<p class="prow__meta mono"><span>' + esc(p.stack) + '</span>' +
  (p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">' + (/github\.com/.test(p.link) ? 'Code' : 'Open') + ' ↗</a>' : '') +
  (p.live ? '<a href="' + esc(p.live) + '" target="_blank" rel="noopener">Live ↗</a>' : '') +
  '</p></div><figure class="prow__fig" aria-hidden="true"><canvas></canvas></figure></div></div></div></li>'
).join('\n');

const file = path.join(root, 'index.html');
const html = fs.readFileSync(file, 'utf8');
const start = '<!-- prerender:projects -->', end = '<!-- /prerender:projects -->';
const a = html.indexOf(start), b = html.indexOf(end);
if (a === -1 || b === -1) throw new Error('prerender markers not found in index.html');
fs.writeFileSync(file, html.slice(0, a + start.length) + '\n' + rows + '\n' + html.slice(b));
console.log('prerendered ' + projects.length + ' projects');
