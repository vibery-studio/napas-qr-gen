import { describe, expect, it } from "vitest";
import { qrPng } from "./qr";
import { buildVietQR, parseAmount, parseVietQR } from "./vietqr";

describe("buildVietQR", () => {
  it("is deterministic and CRC-suffixed", () => {
    const input = { bin: "970418", acc: "0123456789", amount: "100000", des: "DH001 TEST" };
    const a = buildVietQR(input);
    const b = buildVietQR(input);
    expect(a).toBe(b);
    expect(a.startsWith("000201010212")).toBe(true);
    expect(/6304[0-9A-F]{4}$/.test(a)).toBe(true);
  });

  it("keeps every plus in field 62-08", () => {
    const des = "+INV+001+ THANH TOAN+";
    const p = buildVietQR({
      bin: "970418",
      acc: "0123456789",
      amount: "100000",
      des,
    });
    expect(p).toContain("08" + String(des.length).padStart(2, "0") + des);
    expect((p.match(/\+/g) || []).length).toBe(4);
  });

  it("omits amount as static QR", () => {
    const p = buildVietQR({ bin: "970416", acc: "0123456789" });
    expect(p.includes("010211")).toBe(true);
    expect(p.includes("53037045802VN")).toBe(true);
  });
});

describe("qrPng", () => {
  it("emits a PNG signature", async () => {
    const p = await qrPng("hello");
    expect([...p.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });
});

describe("parseAmount", () => {
  it("strips thousand separators", () => {
    expect(parseAmount("9.600.000")).toBe("9600000");
    expect(parseAmount("")).toBeUndefined();
  });
});

describe("parseVietQR", () => {
  it("round-trips build output, plus signs intact", () => {
    const des = "+BHXH+103+00+TL9365L+ 07909+ DONG BHXH+";
    const p = buildVietQR({ bin: "970418", acc: "3159832107", amount: "9600000", des });
    const r = parseVietQR(p);
    expect(r).toMatchObject({
      crcOk: true, vietqr: true, dynamic: true, bin: "970418", acc: "3159832107",
      amount: "9600000", currency: "704", country: "VN", service: "QRIBFTTA", des,
    });
  });

  it("flags bad CRC", () => {
    const p = buildVietQR({ bin: "970416", acc: "0123456789" });
    const bad = p.slice(0, -4) + (p.endsWith("0000") ? "FFFF" : "0000");
    const r = parseVietQR(bad);
    expect(r.crcOk).toBe(false);
    expect(r.dynamic).toBe(false);
    expect(r.amount).toBeUndefined();
  });

  it("rejects non-payment QR", () => {
    expect(() => parseVietQR("https://example.com")).toThrow();
    expect(() => parseVietQR("000201010212389")).toThrow(/malformed/);
  });
});
