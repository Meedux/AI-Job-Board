const fs = require('fs');
const s = fs.readFileSync('components/JobOverview.js', 'utf8');
const re = /<\/?([A-Za-z0-9_:\-]+)([^>]*?)(\/?)>/g;
const stack = [];
let m;
while ((m = re.exec(s)) !== null) {
  const full = m[0];
  const tag = m[1];
  const selfClose = m[3] === '/';
  const isClose = full.startsWith('</');
  const pos = m.index;
  const line = s.slice(0, pos).split(/\r?\n/).length;
  console.log('event', isClose ? 'close' : 'open', tag, 'selfClose', selfClose, 'line', line);
  if (isClose) {
    if (stack.length === 0) {
      console.log('extra close', tag, 'line', line);
    } else {
      const last = stack[stack.length-1];
      if (last.tag === tag) stack.pop();
      else {
        console.log('mismatch: closing', tag, 'but last open', last.tag, 'at line', last.line);
        stack.pop();
      }
    }
  } else if (!selfClose) {
    stack.push({tag, line, pos});
  }
}
if (stack.length) console.log('unclosed tags at end:', stack.map(s => ({tag: s.tag, line: s.line}))); else console.log('no unclosed tags');
