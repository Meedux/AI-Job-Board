import fs from 'fs';
const path = 'components/JobOverview.js';
const s = fs.readFileSync(path, 'utf8');

const opens = [];
const closes = [];
let i = 0;
while (i < s.length) {
  if (s.slice(i, i+6) === '</div>') { closes.push(i); i += 6; continue; }
  if (s.slice(i, i+4) === '<div') {
    // ensure it's not self-closing <div ... />
    const rest = s.slice(i, i+200);
    const closeIdx = rest.indexOf('>');
    if (closeIdx !== -1) {
      const tagInner = rest.slice(0, closeIdx+1);
      if (!/\/>\s*$/.test(tagInner)) {
        opens.push(i);
      }
    } else {
      opens.push(i);
    }
    i += 4; continue;
  }
  i++;
}
console.log('opens',opens.length,'closes',closes.length);
const lines = s.split(/\r?\n/);
function posToLine(pos){ let acc=0; for(let i=0;i<lines.length;i++){ acc += lines[i].length + 1; if (pos < acc) return i+1; } return lines.length; }
console.log('first 10 open lines', opens.slice(0,10).map(posToLine));
console.log('last 10 open lines', opens.slice(-10).map(posToLine));
console.log('first 10 close lines', closes.slice(0,10).map(posToLine));
console.log('last 10 close lines', closes.slice(-10).map(posToLine));

// attempt to match opens/closes to find leftover unclosed opens
// sequential matching: push on open, pop on close; this will find which opens remain
const seqStack = [];
// Build a merged list of events to process in order
const events = [];
for (let p of opens) events.push({ pos: p, type: 'open' });
for (let p of closes) events.push({ pos: p, type: 'close' });
events.sort((a,b) => a.pos - b.pos);

for (let ev of events) {
  if (ev.type === 'open') seqStack.push(ev.pos);
  else {
    if (seqStack.length > 0) seqStack.pop();
    else console.log('extra close at line', posToLine(ev.pos));
  }
}

if (seqStack.length) console.log('sequential unclosed <div> at lines', seqStack.map(posToLine)); else console.log('no sequential unclosed <div>');

if (seqStack.length) {
  console.log('\nContext around unclosed tags:\n');
  const lines = s.split(/\r?\n/);
  for (let ln of seqStack.map(posToLine)) {
    const start = Math.max(ln - 4, 1);
    const end = Math.min(ln + 4, lines.length);
    console.log('--- around line', ln, '---');
    for (let i = start; i <= end; i++) console.log(i + ':', lines[i-1]);
  }
}

// show stack state at position of 'Content Section' comment
const contentIdx = s.indexOf('{/* Content Section */}');
if (contentIdx !== -1) {
  // process events up to contentIdx
  const tempStack = [];
  for (let ev of events) {
    if (ev.pos > contentIdx) break;
    if (ev.type === 'open') tempStack.push(ev.pos);
    else tempStack.pop?.();
  }
  console.log('\nStack state at Content Section (line ' + posToLine(contentIdx) + '):', tempStack.map(posToLine));
} else {
  console.log('\nContent Section marker not found');
}
