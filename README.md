# napas-qr

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/vibery-studio/napas-qr)

Worker tạo mã **VietQR / NAPAS** cho mọi ngân hàng Việt Nam. Nội dung chuyển khoản giữ nguyên — kể cả dấu `+`. Không phải cổng thanh toán, chỉ sinh QR.

## Dùng

| | |
|---|---|
| Giao diện | `/` |
| Ảnh QR | `/img?acc=&bank=&amount=&des=` |
| Trang chia sẻ (có thông tin) | `/p?...&showinfo=1` |
| Trang chia sẻ (chỉ QR) | `/p?...&showinfo=0` |
| Prompt cho agent | `/prompt` — nút **Copy** trên trang chủ |

`des` phải `encodeURIComponent`. Dấu `+` thành `%2B`. Bỏ dấu tiếng Việt (`á`→`a`, `đ`→`d`); không bỏ `+`.

`bank` = BIN 6 số, `code`, hoặc `short_name`. Tra cứu (đừng đoán):

- [`/banks.md`](https://github.com/vibery-studio/napas-qr) — bảng
- `/banks.csv`
- `/banks` — JSON

Ví dụ:

```
/img?acc=0123456789&bank=BIDV&amount=100000&des=DH001%20thanh%20toan
```

## Tự deploy

Bấm nút **Deploy to Cloudflare** phía trên, hoặc:

```bash
npm i
npx wrangler deploy
```

## Agent

Copy prompt trên UI, hoặc xem `AGENT.md` / `GET /prompt`.
