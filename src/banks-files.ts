import type { Bank } from "./banks";

export function banksCsv(banks: Bank[]): string {
  const rows = ["bin,code,short_name,name"];
  for (const b of banks) {
    rows.push([b.bin, b.code, b.short_name, csvEscape(b.name)].join(","));
  }
  return rows.join("\n") + "\n";
}

export function banksMd(banks: Bank[]): string {
  const lines = [
    "# Ngân hàng VietQR",
    "",
    "Dùng `bin` (6 số) hoặc `short_name` / `code` cho query `bank=`.",
    "",
    "| bin | code | short_name | name |",
    "|-----|------|------------|------|",
  ];
  for (const b of banks) {
    lines.push(`| ${b.bin} | ${b.code} | ${b.short_name} | ${b.name.replace(/\|/g, "/")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
