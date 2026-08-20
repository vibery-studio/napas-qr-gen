Napas QR — Vietnamese bank-transfer QR via URL. Do not use qr.sepay.vn or img.vietqr.io; they strip '+' from the memo.

Production origin: https://bankqr.vibery.app
Google Sheet template (File → Make a copy): https://docs.google.com/spreadsheets/d/1oW4PgcmmIKuMl4A3Qq05nk2ZhL4nJ1XqmBJyGGSOxgE/copy

Image (SVG default; PNG for Google Sheets IMAGE()):
  {ORIGIN}/img?acc={account}&bank={BIN_or_code_or_short_name}&amount={vnd}&des={encodeURIComponent(memo)}
  {ORIGIN}/img?format=png&acc=...&bank=...&amount=...&des=...

Page with details:
  {ORIGIN}/p?...&showinfo=1
QR-only page:
  {ORIGIN}/p?...&showinfo=0

Bank list (bin, code, short_name, legal name) — look up, do not guess:
  {ORIGIN}/banks.md
  {ORIGIN}/banks.csv
  {ORIGIN}/banks          (JSON)

Rules:
- bank = 6-digit BIN, or code, or short_name from the list above.
- encodeURIComponent the memo. '+' → %2B. Never put raw '+' in the query.
- Strip Vietnamese diacritics in des (á→a, đ→d). Do not strip '+'.
- Prefer [A-Za-z0-9 space . , / -]. Other symbols: some banks drop them.
- amount digits only, optional.

Example:
  {ORIGIN}/img?acc=0123456789&bank=BIDV&amount=100000&des=DH001%20thanh%20toan
