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

export function crc16(s: string): string {
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

export type ParsedVietQR = {
  payload: string;
  crcOk: boolean;
  vietqr: boolean;
  dynamic: boolean;
  bin?: string;
  acc?: string;
  service?: string;
  amount?: string;
  currency?: string;
  country?: string;
  des?: string;
  name?: string;
  city?: string;
  fields: Record<string, string>;
};

function readTlv(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  while (i < s.length) {
    const id = s.slice(i, i + 2);
    const len = Number(s.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(id) || !Number.isInteger(len) || i + 4 + len > s.length) {
      throw new Error(`malformed TLV at ${i}`);
    }
    out[id] = s.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
}

/** Parse an EMVCo/NAPAS payload. Memo returned byte-for-byte (keeps '+'). */
export function parseVietQR(raw: string): ParsedVietQR {
  const payload = raw.trim();
  if (!payload.startsWith("000201")) throw new Error("not an EMV payment QR");
  const fields = readTlv(payload);
  const crcAt = payload.lastIndexOf("6304");
  const crcOk = crcAt >= 0 && crcAt === payload.length - 8 &&
    crc16(payload.slice(0, crcAt + 4)) === payload.slice(crcAt + 4).toUpperCase();

  const r: ParsedVietQR = {
    payload,
    crcOk,
    vietqr: false,
    dynamic: fields["01"] === "12",
    amount: fields["54"],
    currency: fields["53"],
    country: fields["58"],
    name: fields["59"],
    city: fields["60"],
    fields,
  };
  const m = fields["38"] ? readTlv(fields["38"]) : undefined;
  if (m?.["00"] === "A000000727") {
    r.vietqr = true;
    r.service = m["02"];
    if (m["01"]) {
      const b = readTlv(m["01"]);
      r.bin = b["00"];
      r.acc = b["01"];
    }
  }
  if (fields["62"]) r.des = readTlv(fields["62"])["08"];
  return r;
}
