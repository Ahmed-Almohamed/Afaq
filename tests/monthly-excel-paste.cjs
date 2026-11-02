const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const acorn = require('acorn');
const source=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8');
const body=acorn.parse(source,{ecmaVersion:'latest'}).body[0].expression.callee.body.body;
const funcs=body.filter(n=>n.type==='FunctionDeclaration').map(n=>source.slice(n.start,n.end)).join('\n');
const context=vm.createContext({reportStoreNames:{'micro store':'مايكرو'}, currentMarket:'saudi', reportStores:['micro store'],monthlyNoReplyRates:{'micro store':45}});
vm.runInContext(funcs,context);
const input=fs.readFileSync(path.join(__dirname,'fixtures/monthly-sales.tsv'),'utf8');
const lines=input.trimEnd().split('\n');
const expected={replied:79,noReply:91,grandTotal:170,totalWhatsapp:34,totalWebsite:45};
function check(text){const result=context.parseMonthlyPasteStats(text);assert.equal(result.fromTable,true);for(const [k,v] of Object.entries(expected))assert.equal(result[k],v,k);assert.deepEqual(JSON.parse(JSON.stringify(result.waTotals)),{tiktok:10,snapchat:4,google:8,referral:12,instagram:0,youtube:0});assert.deepEqual(JSON.parse(JSON.stringify(result.siteTotals)),{tiktok:19,snapchat:2,google:9,referral:11,instagram:3,youtube:1});return result;}
const parsed=check(input);
check(lines.slice(0,-1).join('\n')); // Daily rows only: sum them without a footer.
check(lines.slice(2).join('\n')); // Original headerless 17-column paste, leading blanks retained.
function markdown(rows){return rows.map(row=>'| '+row.join(' | ')+' |').join('\n');}
const cells=lines.map(line=>line.split('\t'));
check(markdown([cells[0],Array(17).fill('---'),...cells.slice(1)]));
check(markdown([cells[2],Array(17).fill(':--:'),...cells.slice(3)]));
check(input.replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[Number(d)]));
check(input.replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]));
// Channel order is read from headings, not guessed from fixed column positions.
const swapped=cells.map((row,index)=>{if(index===0)return row;const copy=[...row];[copy[0],copy[2]]=[copy[2],copy[0]];return copy;});check(swapped.map(r=>r.join('\t')).join('\n'));
// Total-only table must retain its first populated cell.
check([cells[0],cells[1],cells.at(-1)].map(r=>r.join('\t')).join('\n'));
// A blank first cell in a daily row is not evidence that this row is a total.
const twoDays=[cells[0],cells[1],cells[2],cells[3]].map(r=>r.join('\t')).join('\n');
const small=context.parseMonthlyPasteStats(twoDays);assert.equal(small.replied,6);assert.equal(small.noReply,10);assert.equal(small.grandTotal,16);
assert.equal(context.spreadsheetNumber(''),null);assert.equal(context.spreadsheetNumber('0'),0);assert.equal(context.spreadsheetNumber('١٬٢٣٤'),1234);assert.equal(context.spreadsheetNumber('12,5'),12.5);
assert.equal(context.parseMonthlyPasteStats('| 1 | 2 | 3 |\n| 4 | 5 | 6 |').fromTable,false);
const plain=context.parseMonthlyPasteStats('-رد: 79\n-لم يرد: 91\n-اجمالي المبيعات:170');assert.equal(plain.noReply,91);assert.equal(plain.fromTable,false);
const block=context.monthlySalesBlock('micro store',parsed);assert.match(block,/اجمالي الواتس 34/);assert.match(block,/- تيك توك 10/);assert.match(block,/اجمالي الموقع 45/);assert.match(block,/-لم يرد: 91/);assert.match(block,/-اجمالي المبيعات:170/);
console.log('PASS: supplied monthly table, headerless template, TSV/Markdown, correct channel order, totals without double counting, no-footer sums, summary-only paste, reordered headings, Arabic/Persian digits, and report output.');
