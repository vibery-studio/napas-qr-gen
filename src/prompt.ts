export const AGENT_PROMPT = `Napas QR — generate Vietnamese bank-transfer QR via URL. Do not use qr.sepay.vn or img.vietqr.io; they strip '+' from the memo.

Image (embed in <img src>):
  {ORIGIN}/img?acc={account}&bank={BIN_or_short_name}&amount={vnd}&des={encodeURIComponent(memo)}

Share page with transfer details:
  {ORIGIN}/p?acc=...&bank=...&amount=...&des=...&showinfo=1

Share page, QR only:
  {ORIGIN}/p?acc=...&bank=...&amount=...&des=...&showinfo=0

Rules:
- encodeURIComponent the memo. '+' must become %2B. Never put raw '+' in the query (it becomes a space).
- Do not sanitize, ASCII-fold, or strip '+' / spaces from des.
- amount digits only (optional). bank = 6-digit BIN or short_name (BIDV, ACB, ShinhanBank, Techcombank, Vietcombank, …).
- Bank list: GET {ORIGIN}/banks
- If des contains '+' and you can decode the QR, field 62-08 must still contain those pluses.

Example:
  {ORIGIN}/img?acc=0123456789&bank=BIDV&amount=100000&des=DH001%20thanh%20toan
`;

export function agentPrompt(origin: string): string {
  return AGENT_PROMPT.replaceAll("{ORIGIN}", origin);
}
