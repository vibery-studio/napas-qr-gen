import { banks, resolveBank } from "./banks";
import { banksCsv, banksMd } from "./banks-files";
import { stripVn } from "./memo";
import { agentPrompt } from "./prompt";
import { qrPng, qrSvg } from "./qr";
import { formPage, sharePage } from "./ui";
import { buildVietQR, parseAmount } from "./vietqr";

const CACHE = "public, max-age=31536000, immutable";
const PINK = "#ff2e6a";

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "access-control-allow-origin": "*" } });
}

function text(body: string, type = "text/plain; charset=utf-8", extra: HeadersInit = {}): Response {
  return new Response(body, {
    headers: { "content-type": type, "access-control-allow-origin": "*", ...extra },
  });
}

function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function transferFrom(url: URL) {
  const acc = (url.searchParams.get("acc") || "").trim();
  const bankRaw = (url.searchParams.get("bank") || "").trim();
  const amount = parseAmount(url.searchParams.get("amount"));
  const des = stripVn(url.searchParams.get("des") ?? "");
  if (!acc) throw new Error("acc required");
  if (!bankRaw) throw new Error("bank required");
  const bank = resolveBank(bankRaw);
  const payload = buildVietQR({ bin: bank.bin, acc, amount, des: des || undefined });
  return { acc, bank, amount, des, payload };
}

function imgUrl(origin: string, url: URL): string {
  const q = new URLSearchParams();
  for (const k of ["acc", "bank", "amount", "des"] as const) {
    const v = url.searchParams.get(k);
    if (v !== null && v !== "") q.set(k, v);
  }
  return `${origin}/img?${q.toString()}`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const origin = url.origin;

      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
          },
        });
      }

      if (url.pathname === "/" && request.method === "GET") {
        return text(formPage(banks, origin), "text/html; charset=utf-8");
      }

      if (url.pathname === "/banks" || url.pathname === "/banks.json") return json(banks);
      if (url.pathname === "/banks.csv") {
        return text(banksCsv(banks), "text/csv; charset=utf-8", {
          "content-disposition": 'inline; filename="banks.csv"',
        });
      }
      if (url.pathname === "/banks.md") {
        return text(banksMd(banks), "text/markdown; charset=utf-8");
      }
      if (url.pathname === "/prompt") return text(agentPrompt(origin));

      if (url.pathname === "/img") {
        const t = transferFrom(url);
        const format = (url.searchParams.get("format") || "").toLowerCase();
        const wantPng = format === "png" || request.headers.get("accept")?.includes("image/png");
        if (wantPng) {
          const png = await qrPng(t.payload);
          return new Response(png, {
            headers: {
              "content-type": "image/png",
              "cache-control": CACHE,
              "access-control-allow-origin": "*",
            },
          });
        }
        const svg = qrSvg(t.payload);
        return text(svg, "image/svg+xml; charset=utf-8", { "cache-control": CACHE });
      }

      if (url.pathname === "/p") {
        const t = transferFrom(url);
        const showinfo = url.searchParams.get("showinfo") !== "0";
        const image = imgUrl(origin, url);
        const ticket = qrSvg(t.payload, { px: 440, dark: "#ffffff", light: PINK });
        const ticketSrc = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ticket);
        return text(
          sharePage({
            ticketSrc,
            bankLabel: `${t.bank.short_name} · ${t.bank.bin}`,
            acc: t.acc,
            amount: t.amount,
            des: t.des || undefined,
            showinfo,
            imgUrl: image,
            pageUrl: url.toString(),
          }),
          "text/html; charset=utf-8",
        );
      }

      return err("not found", 404);
    } catch (e) {
      const message = e instanceof Error ? e.message : "error";
      console.error(JSON.stringify({ message: "request failed", error: message }));
      return err(message, 400);
    }
  },
} satisfies ExportedHandler;
