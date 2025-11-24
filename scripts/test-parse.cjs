const fs = require('fs');
const parser = require('@babel/parser');
const src = fs.readFileSync('components/JobOverview.js', 'utf8');
const lines = src.split(/\r?\n/);
const upToLine = 240;
const part = lines.slice(0, upToLine).join('\n');
const returnIndex = src.indexOf('\n  return (');
console.log('returnIndex', returnIndex);
const sliceFromReturn = src.slice(returnIndex, 10600); // slice around error
console.log('\n---- snippet around return -> error ----');
console.log(sliceFromReturn.slice(0, 600));
try {
  parser.parse(part, { sourceType: 'module', plugins: ['jsx'] });
  console.log('parse up to line', upToLine, 'OK');
} catch (e) {
  console.error('parse error up to line', upToLine, e.message);
}
try {
  parser.parse(src, { sourceType: 'module', plugins: ['jsx'] });
  console.log('parse full file OK');
} catch (e) {
  console.error('parse full file error:', e.message, 'at', e.loc);
}
