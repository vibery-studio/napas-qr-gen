import type { Bank } from "./banks";
import { agentPrompt } from "./prompt";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap");
:root {
  --page: #f3f3f5;
  --ink: #111113;
  --mute: #8a8a93;
  --line: #ececee;
  --card: #fff;
  --pink: #ff2e6a;
  --pill: #f2f2f4;
}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--page); color: var(--ink);
  font-family: "Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif; }
body { min-height: 100dvh; }
.shell { max-width: 430px; margin: 0 auto; padding: 28px 22px 72px; }
.back { display: inline-flex; color: var(--ink); text-decoration: none; font-size: 1.4rem; line-height: 1; margin-bottom: 18px; }
h1 { font-size: 1.7rem; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 6px; }
.lede { color: var(--mute); margin: 0 0 28px; font-size: 0.95rem; line-height: 1.45; font-weight: 400; }
label { display: block; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--mute); margin: 14px 0 8px; }
input, textarea { width: 100%; font: 500 1rem/1.4 "Be Vietnam Pro", sans-serif; padding: 14px 16px;
  border: 0; border-radius: 16px; background: var(--card); color: var(--ink); box-shadow: 0 1px 0 rgba(0,0,0,.04); }
textarea { min-height: 88px; resize: vertical; }
.toggle { display: flex; align-items: center; gap: 10px; margin: 18px 0; font-size: 0.95rem; font-weight: 500;
  text-transform: none; letter-spacing: 0; color: var(--ink); }
.toggle input { width: 18px; height: 18px; accent-color: var(--pink); }
.primary { width: 100%; margin-top: 8px; border: 0; border-radius: 999px; padding: 16px; font: 600 1rem "Be Vietnam Pro", sans-serif;
  background: var(--ink); color: #fff; cursor: pointer; }
.primary:hover { background: var(--pink); }
.warn { display: none; margin: 8px 0 0; padding: 10px 12px; border-radius: 12px; background: #fff4e5; color: #8a5800;
  font-size: 0.82rem; font-weight: 500; }
.warn.on { display: block; }
.combo { position: relative; }
.combo input { padding-right: 36px; }
.combo-list { display: none; position: absolute; z-index: 5; left: 0; right: 0; top: calc(100% + 6px);
  max-height: 240px; overflow: auto; background: #fff; border-radius: 16px;
  box-shadow: 0 16px 40px rgba(17,17,19,.12); padding: 6px; }
.combo-list.open { display: block; }
.combo-list button { display: block; width: 100%; text-align: left; border: 0; background: transparent;
  padding: 10px 12px; border-radius: 12px; font: 500 0.9rem "Be Vietnam Pro", sans-serif; cursor: pointer; color: var(--ink); }
.combo-list button:hover, .combo-list button[aria-selected="true"] { background: var(--pill); }
.combo-list .sub { display: block; color: var(--mute); font-size: 0.75rem; font-weight: 400; }
.agent { margin-top: 36px; }
.agent-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.agent-head h2 { font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mute); margin: 0; font-weight: 600; }
.copy { margin: 0; border: 0; background: var(--ink); color: #fff; border-radius: 999px; padding: 8px 14px;
  font: 600 0.85rem "Be Vietnam Pro", sans-serif; cursor: pointer; }
.copy.ok { background: var(--pink); }
#prompt { width: 100%; min-height: 200px; font: 400 0.75rem/1.45 ui-monospace, Menlo, monospace; padding: 14px;
  border: 0; border-radius: 16px; background: var(--card); color: var(--ink); resize: vertical; white-space: pre; }
.links { margin: 12px 0 0; font-size: 0.8rem; color: var(--mute); }
.links a { color: var(--ink); }

.ticket-wrap { margin-top: 8px; }
.ticket { position: relative; background: var(--pink); color: #fff; border-radius: 32px 32px 0 0; padding: 48px 24px 20px; text-align: center; }
.ticket::before { content: ""; width: 64px; height: 32px; background: var(--page); border-radius: 0 0 32px 32px;
  position: absolute; top: 0; left: 50%; transform: translateX(-50%); }
.ticket img, .ticket svg { width: 210px; height: 210px; margin: 8px auto 18px; display: block; background: transparent; }
.ticket h2 { font-size: 1.15rem; font-weight: 700; margin: 0 0 4px; letter-spacing: -0.02em; }
.ticket .who { opacity: .85; font-size: 0.82rem; margin: 0 0 16px; font-weight: 400; }
.chip { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.2); border-radius: 999px;
  padding: 8px 12px; font-size: 0.78rem; font-weight: 500; max-width: 100%; cursor: pointer; }
.chip button { border: 0; background: transparent; color: #fff; cursor: pointer; font-size: 1rem; }
.scallop { height: 14px; background:
  radial-gradient(circle at 12px 0, var(--page) 12px, var(--pink) 12.5px) 0 0 / 24px 14px repeat-x; }
.meta-block { white-space: pre-wrap; font-size: 0.88rem; font-weight: 500; opacity: .95; margin: 0 0 14px; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 22px; }
.actions a, .actions button { display: flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--card); color: var(--ink); text-decoration: none; border: 0; border-radius: 999px;
  padding: 14px 10px; font: 600 0.92rem "Be Vietnam Pro", sans-serif; cursor: pointer; box-shadow: 0 1px 0 rgba(0,0,0,.04); }
`;

export function formPage(banks: Bank[], origin: string): string {
  const sorted = banks.slice().sort((a, b) => a.short_name.localeCompare(b.short_name));
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR chuyển khoản</title>
  <style>${css}</style>
</head>
<body>
<div class="shell">
  <h1>QR Code</h1>
  <p class="lede">Tạo QR chuyển khoản. Dấu tiếng Việt được bỏ tự động; dấu + giữ nguyên.</p>
  <form id="f">
    <label>Ngân hàng</label>
    <div class="combo" id="combo">
      <input id="bankq" type="search" placeholder="Tìm tên, short name, BIN…" autocomplete="off" required>
      <input type="hidden" name="bank" id="bank">
      <div class="combo-list" id="banklist" role="listbox"></div>
    </div>
    <label>Số tài khoản</label>
    <input name="acc" required autocomplete="off" inputmode="numeric">
    <label>Số tiền (VND)</label>
    <input name="amount" inputmode="numeric" placeholder="Để trống nếu người nhận tự nhập">
    <label>Nội dung chuyển</label>
    <textarea name="des" id="des" placeholder="DH001 thanh toan"></textarea>
    <p class="warn" id="warn"></p>
    <label class="toggle"><input type="checkbox" name="showinfo" checked> Hiện thông tin trên trang QR</label>
    <button class="primary" type="submit">Tạo QR</button>
  </form>
  <section class="agent" aria-labelledby="agent-label">
    <div class="agent-head">
      <h2 id="agent-label">Agent prompt</h2>
      <button type="button" class="copy" id="copy">Copy</button>
    </div>
    <textarea id="prompt" readonly spellcheck="false">${esc(agentPrompt(origin))}</textarea>
    <p class="links">Danh sách NH: <a href="/banks.md">banks.md</a> · <a href="/banks.csv">banks.csv</a></p>
  </section>
</div>
<script>
const BANKS = ${JSON.stringify(sorted)};
function stripVn(s) {
  return s.replace(/đ/g,'d').replace(/Đ/g,'D').normalize('NFD').replace(/\\p{M}/gu,'');
}
const SAFE = /[A-Za-z0-9 .,/\\-+]/;
const q = document.getElementById('bankq');
const hidden = document.getElementById('bank');
const list = document.getElementById('banklist');
let hi = 0;
function filter(term) {
  const t = stripVn(term).toLowerCase();
  if (!t) return BANKS.slice(0, 12);
  return BANKS.filter(b => [b.short_name, b.code, b.bin, b.name].some(x => stripVn(x).toLowerCase().includes(t))).slice(0, 20);
}
function render(items) {
  list.innerHTML = items.map((b,i) =>
    '<button type="button" role="option" data-i="'+i+'" data-bin="'+b.bin+'"><strong>'+b.short_name+'</strong> · '+b.code+' · '+b.bin+'<span class="sub">'+b.name+'</span></button>'
  ).join('') || '<button type="button" disabled>Không thấy ngân hàng</button>';
  hi = 0;
  [...list.querySelectorAll('button[data-bin]')].forEach((el,i) => el.setAttribute('aria-selected', i===hi ? 'true':'false'));
}
function pick(bin) {
  const b = BANKS.find(x => x.bin === bin);
  if (!b) return;
  hidden.value = b.bin;
  q.value = b.short_name + ' · ' + b.bin;
  list.classList.remove('open');
}
q.addEventListener('focus', () => { render(filter(q.value)); list.classList.add('open'); });
q.addEventListener('input', () => { hidden.value = ''; render(filter(q.value)); list.classList.add('open'); });
list.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('button[data-bin]');
  if (btn) pick(btn.dataset.bin);
});
q.addEventListener('keydown', (e) => {
  const items = [...list.querySelectorAll('button[data-bin]')];
  if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hi+1, items.length-1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.max(hi-1, 0); }
  else if (e.key === 'Enter' && list.classList.contains('open') && items[hi]) { e.preventDefault(); pick(items[hi].dataset.bin); return; }
  else if (e.key === 'Escape') { list.classList.remove('open'); return; }
  items.forEach((el,i) => el.setAttribute('aria-selected', i===hi ? 'true':'false'));
  items[hi]?.scrollIntoView({ block: 'nearest' });
});
document.addEventListener('click', (e) => { if (!e.target.closest('#combo')) list.classList.remove('open'); });

const des = document.getElementById('des');
const warn = document.getElementById('warn');
function checkDes() {
  const start = des.selectionStart, end = des.selectionEnd;
  const folded = stripVn(des.value);
  if (folded !== des.value) { des.value = folded; des.setSelectionRange(start, end); }
  const odd = [];
  for (const ch of des.value) if (!SAFE.test(ch) && !odd.includes(ch)) odd.push(ch);
  if (odd.length) {
    warn.textContent = 'Ký tự có thể bị ngân hàng bỏ: ' + odd.map(c => JSON.stringify(c)).join(' ');
    warn.classList.add('on');
  } else if (des.value.includes('+')) {
    warn.textContent = 'Dấu + được giữ, nhưng không phải ngân hàng nào cũng nhận.';
    warn.classList.add('on');
  } else warn.classList.remove('on');
}
des.addEventListener('input', checkDes);

document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!hidden.value) { q.focus(); list.classList.add('open'); render(filter(q.value)); return; }
  checkDes();
  const fd = new FormData(e.target);
  const p = new URLSearchParams();
  p.set('acc', String(fd.get('acc')||'').trim());
  p.set('bank', hidden.value);
  const amount = String(fd.get('amount')||'').replace(/[^\\d]/g,'');
  if (amount) p.set('amount', amount);
  const memo = stripVn(String(fd.get('des')||''));
  if (memo) p.set('des', memo);
  p.set('showinfo', fd.get('showinfo') ? '1' : '0');
  location.href = '/p?' + p.toString();
});
const ta = document.getElementById('prompt');
const btn = document.getElementById('copy');
ta.addEventListener('focus', () => ta.select());
ta.addEventListener('click', () => ta.select());
btn.addEventListener('click', async () => {
  ta.select();
  try { await navigator.clipboard.writeText(ta.value); } catch { document.execCommand('copy'); }
  btn.textContent = 'Copied'; btn.classList.add('ok');
  setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1500);
});
</script>
</body></html>`;
}

export function sharePage(opts: {
  ticketSrc: string;
  bankLabel: string;
  acc: string;
  amount?: string;
  des?: string;
  showinfo: boolean;
  imgUrl: string;
  pageUrl: string;
}): string {
  const title = opts.showinfo ? (opts.des || "Chuyển khoản") : "QR";
  const who = opts.showinfo ? `${opts.bankLabel} · ${opts.acc}` : "";
  const amount = opts.showinfo && opts.amount ? `${Number(opts.amount).toLocaleString("vi-VN")}₫` : "";
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR chuyển khoản</title>
  <style>${css}</style>
</head>
<body>
<div class="shell">
  <a class="back" href="/" aria-label="Quay lại">←</a>
  <h1>QR Code</h1>
  <p class="lede">Quét mã để chuyển khoản.</p>
  <div class="ticket-wrap">
    <div class="ticket">
      <img src="${esc(opts.ticketSrc)}" width="210" height="210" alt="VietQR">
      <h2>${esc(title)}</h2>
      ${who ? `<p class="who">${esc(who)}${amount ? " · " + esc(amount) : ""}</p>` : ""}
      <div class="chip" id="copylink" role="button" tabindex="0"><span>Copy link</span> ⧉</div>
    </div>
    <div class="scallop"></div>
  </div>
  <div class="actions">
    <button type="button" id="share">Share link</button>
    <a href="${esc(opts.imgUrl)}" download="vietqr.svg">Download</a>
  </div>
</div>
<script>
const pageUrl = ${JSON.stringify(opts.pageUrl)};
const imgUrl = ${JSON.stringify(opts.imgUrl)};
document.getElementById('copylink').onclick = async () => {
  try { await navigator.clipboard.writeText(pageUrl); } catch {}
};
document.getElementById('copylink').onkeydown = (e) => { if (e.key === 'Enter') e.target.click(); };
document.getElementById('share').onclick = async () => {
  if (navigator.share) { try { await navigator.share({ url: pageUrl, title: 'QR chuyển khoản' }); return; } catch {} }
  try { await navigator.clipboard.writeText(pageUrl); } catch {}
};
</script>
</body></html>`;
}
