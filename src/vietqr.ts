/** NAPAS VietQR EMV payload. Memo is copied byte-for-byte — never strip '+'. */

export type VietQRInput = {
  bin: string;
  acc: string;
  amount?: string;
  des?: string;
};

function tlv(id: string, val: string): string {
  if (val.length > 99) throw new Error(`TLV ${id} too long (${val.length})`);
  return id + String(val.length).padStart(2, "0") + val;
}

function crc16(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildVietQR({ bin, acc, amount, des }: VietQRInput): string {
  if (!/^\d{6}$/.test(bin)) throw new Error("bin must be 6 digits");
  if (!acc) throw new Error("acc required");

  const merchant =
    tlv("00", "A000000727") +
    tlv("01", tlv("00", bin) + tlv("01", acc)) +
    tlv("02", "QRIBFTTA");

  const dynamic = Boolean(amount);
  let p =
    tlv("00", "01") +
    tlv("01", dynamic ? "12" : "11") +
    tlv("38", merchant) +
    tlv("53", "704");
  if (amount) p += tlv("54", amount);
  p += tlv("58", "VN");
  if (des) p += tlv("62", tlv("08", des));
  p += "6304";
  p += crc16(p);

  if (des?.includes("+") && !p.includes("+")) {
    throw new Error("payload dropped plus signs");
  }
  return p;
}

export function parseAmount(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const n = raw.replace(/[^\d]/g, "");
  return n.length ? n : undefined;
}
