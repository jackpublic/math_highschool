const fs = require('fs');
const base = 'D:/Trading/AI_Investing/';
const md = fs.readFileSync(base + 'algebra_ca_crosswalk.md', 'utf8');
const standards = fs.readFileSync('D:/CHS/math_highschool/ca_standards.md', 'utf8');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const data = {}; let course = '';
for (const line of standards.split(/\r?\n/)) {
  if (/^## /.test(line)) course = line.slice(3).trim();
  const m = line.match(/^\|\s*([A-Z]-[^|]+?)\s*\|\s*(.*?)\s*\|$/);
  if (m) (data[course] ||= {})[m[1].trim().replace(/\.$/,'')] = m[2];
}
const inline = s => esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2">$1</a>').replace(/&lt;br\s*\/?&gt;/gi,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
let body = '', active = '', inTable = false, missing = [];
for (const line of md.split(/\r?\n/)) {
  if (line.startsWith('| ---')) continue;
  if (line.startsWith('| ')) {
    if (!inTable) {body += '<div class="table-wrap"><table>'; inTable = true;}
    const cells = line.slice(1,-1).split('|').map(x=>x.trim());
    if (cells[0] === 'CA standard No.') {body += '<thead><tr><th>CA standard No.</th><th>Potentially relevant lessons (teacher and student)</th></tr></thead><tbody>'; continue;}
    const id = cells[0].replace(/\s*\(\+\)\s*$/, '').trim();
    const definition = data[active]?.[id];
    if (!definition) missing.push(active + ': ' + id);
    const first = definition ? `<span class="standard"><a href="#" class="standard-link" aria-expanded="false">${esc(cells[0])}</a><span class="tip" role="tooltip">${esc(definition)}</span></span>` : esc(cells[0]);
    body += `<tr><td>${first}</td><td>${inline(cells.slice(1).join('|'))}</td></tr>`; continue;
  }
  if (inTable) {body += '</tbody></table></div>'; inTable = false;}
  const h = line.match(/^(#{1,3})\s+(.+)$/);
  if (h) {if (/^Algebra I{1,2}$/.test(h[2])) active = h[2]; const n = h[1].length; body += `<h${n}>${inline(h[2])}</h${n}>`;}
  else if (line.trim()) body += `<p>${inline(line)}</p>`;
}
if (inTable) body += '</tbody></table></div>';
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Algebra California Standards Crosswalk</title><style>body{font:16px/1.55 system-ui,sans-serif;max-width:1200px;margin:auto;padding:24px;color:#182638}h1{color:#17385c}h2,h3{margin-top:2em;color:#244b70}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;margin:1em 0}th,td{text-align:left;vertical-align:top;border:1px solid #cbd5df;padding:10px 12px}th{background:#e8eff6}td:first-child{min-width:130px}tr:nth-child(even){background:#f7f9fb}a{color:#005ea8}.standard{position:relative;display:inline-block}.tip{display:none;position:absolute;z-index:5;top:100%;left:0;width:min(380px,70vw);padding:12px;background:#132b42;color:white;border-radius:6px;box-shadow:0 5px 20px #0004;font-size:.94rem}.standard:hover .tip,.standard:focus-within .tip,.standard.open .tip{display:block}.standard-link:focus-visible{outline:3px solid #df8b00;outline-offset:3px}@media(max-width:600px){body{padding:12px}.tip{position:fixed;top:auto;bottom:12px;left:5vw;width:84vw}}</style></head><body>${body}<script>document.addEventListener('click',e=>{const link=e.target.closest('.standard-link');document.querySelectorAll('.standard.open').forEach(x=>{if(!link||x!==link.parentElement){x.classList.remove('open');x.querySelector('a').setAttribute('aria-expanded','false')}});if(link){e.preventDefault();const s=link.parentElement;s.classList.toggle('open');link.setAttribute('aria-expanded',s.classList.contains('open'))}});document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.standard.open').forEach(x=>{x.classList.remove('open');x.querySelector('a').setAttribute('aria-expanded','false')})})</script></body></html>`;
fs.writeFileSync(base+'algebra_ca_crosswalk.html',html);
console.log('Missing descriptions:', missing.length ? missing.join(', ') : 'none');
