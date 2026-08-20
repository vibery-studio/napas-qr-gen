import raw from "./banks.json";

export type Bank = {
  name: string;
  code: string;
  bin: string;
  short_name: string;
};

const list = (raw as { data: Bank[] }).data;

const byKey = new Map<string, Bank>();
for (const b of list) {
  byKey.set(b.bin, b);
  byKey.set(b.code.toUpperCase(), b);
  byKey.set(b.short_name.toUpperCase(), b);
}

const ALIAS: Record<string, string> = {
  SHB: "970424",
  SHBVN: "970424",
  SHINHAN: "970424",
  TCB: "970407",
  TECHCOM: "970407",
  VCB: "970436",
  ICB: "970415",
  CTG: "970415",
  BIDV: "970418",
  MB: "970422",
  VPB: "970432",
  TPB: "970423",
  STB: "970403",
  HDB: "970437",
  AGR: "970405",
  VBA: "970405",
  AGRIBANK: "970405",
  CAKE: "546034",
  TIMO: "963388",
  MOMO: "971025",
  LIO: "970448",
  LIOBANK: "970448",
};

export const banks: Bank[] = list;

export function resolveBank(input: string): Bank {
  const key = input.trim();
  if (!key) throw new Error("bank required");
  const alias = ALIAS[key.toUpperCase()];
  const hit = byKey.get(key) || byKey.get(key.toUpperCase()) || (alias ? byKey.get(alias) : undefined);
  if (!hit) throw new Error(`unknown bank: ${input}`);
  return hit;
}
