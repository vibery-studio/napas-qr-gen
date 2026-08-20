import type { Bank } from "./banks";
import { agentPrompt } from "./prompt";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

const css = `
:root { color-scheme: light; --ink:#1a1714; --mute:#6b635b; --line:#e6dfd6; --paper:#f7f1e8; --card:#fffdf8; --accent:#0f6b4c; }
* { box-sizing: border-box; }
body { margin:0; font: 16px/1.45 "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif; color:var(--ink); background:var(--paper); }
main { max-width: 720px; margin:0 auto; padding: 40px 20px 80px; }
h1 { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 6px; }
.lede { color: var(--mute); margin: 0 0 28px; }
form, .card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 22px; }
label { display:block; font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--mute); margin: 12px 0 6px; }
input, select, textarea { width:100%; font: inherit; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background:#fff; color: var(--ink); }
textarea { min-height: 72px; font-family: ui-monospace, Menlo, monospace; font-size: 0.92rem; }
.row { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.toggle { display:flex; align-items:center; gap:10px; margin: 18px 0; font-size: 1rem; text-transform:none; letter-spacing:0; color:var(--ink); }
.toggle input { width:18px; height:18px; accent-color: var(--accent); }
button { margin-top: 8px; background: var(--ink); color: var(--paper); border:0; border-radius: 999px; padding: 12px 20px; font: inherit; cursor:pointer; }
button:hover { background: var(--accent); }
.qrwrap { display:flex; flex-direction:column; align-items:center; gap: 12px; margin-top: 24px; }
.qrwrap img { width: 260px; height: 260px; background:#fff; border-radius: 12px; }
.meta { width:100%; font-family: ui-monospace, Menlo, monospace; font-size: 0.9rem; background: #f4efe6; border-radius: 10px; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
.urls { margin-top: 16px; font-size: 0.85rem; color: var(--mute); word-break: break-all; }
.urls a { color: var(--accent); }
.agent { margin-top: 28px; }
.agent-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom: 10px; }
.agent-head h2 { font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--mute); margin:0; font-weight: 600; }
.copy { margin:0; padding: 8px 14px; font-size: 0.9rem; }
.copy.ok { background: var(--accent); }
#prompt { width:100%; min-height: 220px; font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 0.8rem; line-height: 1.45; padding: 12px; border: 1px solid var(--line); border-radius: 10px; background:#fff; color: var(--ink); resize: vertical; white-space: pre; }
@media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
`;

export function formPage(banks: Bank[], origin: string): string {
  const opts = banks
    .slice()
    .sort((a, b) => a.short_name.localeCompare(b.short_name))
    .map((b) => `<option value="${esc(b.bin)}">${esc(b.short_name)} · ${esc(b.bin)}</option>`)
    .join("");
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Napas QR</title>
  <style>${css}</style>
</head>
<body>
<main>
  <h1>Napas QR</h1>
  <p class="lede">Tạo QR chuyển khoản. Nội dung giữ nguyên dấu +.</p>
  <form id="f">
    <div class="row">
      <div>
        <label>Ngân hàng</label>
        <select name="bank" required>${opts}</select>
      </div>
      <div>
        <label>Số tài khoản</label>
        <input name="acc" required autocomplete="off" inputmode="numeric">
      </div>
    </div>
    <label>Số tiền (VND, bỏ trống nếu người nhận tự nhập)</label>
    <input name="amount" inputmode="numeric" placeholder="9600000">
    <label>Nội dung chuyển</label>
    <textarea name="des" placeholder="DH001 thanh toan"></textarea>
    <label class="toggle"><input type="checkbox" name="showinfo" checked> Hiện thông tin chuyển khoản trên trang</label>
    <button type="submit">Tạo QR</button>
  </form>
  <section class="agent card" aria-labelledby="agent-label">
    <div class="agent-head">
      <h2 id="agent-label">Agent prompt</h2>
      <button type="button" class="copy" id="copy">Copy</button>
    </div>
    <textarea id="prompt" readonly spellcheck="false">${esc(agentPrompt(origin))}</textarea>
  </section>
</main>
<script>
document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const q = new URLSearchParams();
  const acc = String(fd.get('acc')||'').trim();
  const bank = String(fd.get('bank')||'').trim();
  const amount = String(fd.get('amount')||'').replace(/[^\\d]/g,'');
  const des = String(fd.get('des')||'');
  const show = fd.get('showinfo') ? '1' : '0';
  q.set('acc', acc);
  q.set('bank', bank);
  if (amount) q.set('amount', amount);
  if (des) q.set('des', des);
  q.set('showinfo', show);
  location.href = '/p?' + q.toString();
});
const ta = document.getElementById('prompt');
const btn = document.getElementById('copy');
ta.addEventListener('focus', () => ta.select());
ta.addEventListener('click', () => ta.select());
btn.addEventListener('click', async () => {
  ta.select();
  try {
    await navigator.clipboard.writeText(ta.value);
  } catch {
    document.execCommand('copy');
  }
  btn.textContent = 'Copied';
  btn.classList.add('ok');
  setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1500);
});
</script>
</body></html>`;
}

export function sharePage(opts: {
  imgSrc: string;
  bankLabel: string;
  acc: string;
  amount?: string;
  des?: string;
  showinfo: boolean;
  imgUrl: string;
  pageUrl: string;
}): string {
  const details = opts.showinfo
    ? `<div class="meta">${esc(opts.bankLabel)}
${esc(opts.acc)}${opts.amount ? `\n${esc(Number(opts.amount).toLocaleString("vi-VN"))}₫` : ""}${opts.des ? `\n${esc(opts.des)}` : ""}</div>`
    : "";
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR chuyển khoản</title>
  <style>${css}</style>
</head>
<body>
<main>
  <h1>${opts.showinfo ? "Chuyển khoản" : "QR"}</h1>
  <p class="lede"><a href="/">Tạo QR khác</a></p>
  <div class="card qrwrap">
    <img src="${esc(opts.imgSrc)}" width="260" height="260" alt="VietQR">
    ${details}
  </div>
  <p class="urls">Ảnh: <a href="${esc(opts.imgUrl)}">${esc(opts.imgUrl)}</a></p>
</main>
</body></html>`;
}
