# napas-qr

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/vibery-studio/napas-qr)

Worker tạo mã **VietQR / NAPAS** cho mọi ngân hàng Việt Nam. Nội dung chuyển khoản giữ nguyên — kể cả dấu `+`. Không phải cổng thanh toán, chỉ sinh QR.

**Host production:** [https://bankqr.vibery.app](https://bankqr.vibery.app)

**Mẫu Google Sheet** (File → Make a copy): [copy tại đây](https://docs.google.com/spreadsheets/d/1oW4PgcmmIKuMl4A3Qq05nk2ZhL4nJ1XqmBJyGGSOxgE/copy)

Cảnh báo Sheets “external parties” = cột `IMAGE()` tải PNG từ worker. Allow. Tab Banks nằm trong file, không import JSON.

## Dùng

| | |
|---|---|
| Giao diện | `/` |
| Ảnh QR (SVG) | `/img?acc=&bank=&amount=&des=` |
| Ảnh QR (PNG, Google Sheets `IMAGE()`) | `/img?format=png&acc=&bank=&amount=&des=` |
| Trang chia sẻ (có thông tin) | `/p?...&showinfo=1` |
| Trang chia sẻ (chỉ QR) | `/p?...&showinfo=0` |
| Prompt cho agent | `/prompt` — nút **Copy** trên trang chủ |

`des` phải `encodeURIComponent`. Dấu `+` thành `%2B`. Bỏ dấu tiếng Việt (`á`→`a`, `đ`→`d`); không bỏ `+`.

`bank` = BIN 6 số, `code`, hoặc `short_name`. Tra cứu (đừng đoán):

- [`/banks.md`](https://bankqr.vibery.app/banks.md) — bảng
- `/banks.csv`
- `/banks` — JSON

Ví dụ:

```
https://bankqr.vibery.app/img?acc=0123456789&bank=BIDV&amount=100000&des=DH001%20thanh%20toan
https://bankqr.vibery.app/img?format=png&acc=0123456789&bank=BIDV&amount=100000&des=DH001%20thanh%20toan
```

Sheets `IMAGE()` chỉ nhận PNG — luôn thêm `format=png`.

## Tự deploy

Nút **Deploy to Cloudflare** = deploy **một lần**, không theo dõi git.

**Workers Builds (dashboard)** — Worker (không phải Pages) → Settings → Build:

| Field | Giá trị |
|---|---|
| Branch | `main` |
| Build command | *(để trống)* |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

Bật automatic deployments. Push `main` mới chạy.

**GitHub Action** (backup): secret `CLOUDFLARE_API_TOKEN` (Workers Scripts Edit) + `CLOUDFLARE_ACCOUNT_ID`. Workflow: `.github/workflows/deploy.yml`.

Local:

```bash
npm i
npx wrangler deploy
```

## Agent

Copy prompt trên UI, hoặc xem `AGENT.md` / `GET /prompt`.
