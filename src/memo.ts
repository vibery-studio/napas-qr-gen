/** Fold Vietnamese diacritics. Do not strip '+'. */

export function stripVn(s: string): string {
  return s
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Chars most VN bank apps accept in transfer memo. '+' is kept but not universal. */
const SAFE = /[A-Za-z0-9 .,/\-+]/;

export function riskyChars(s: string): string[] {
  const seen = new Set<string>();
  for (const ch of s) {
    if (!SAFE.test(ch)) seen.add(ch);
  }
  return [...seen];
}
