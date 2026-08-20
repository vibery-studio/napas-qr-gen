import { encode } from "uqr";
import { matrixToPng } from "./png";

export function qrMatrix(text: string) {
  return encode(text, { ecc: "M", border: 4 });
}

export async function qrPng(text: string, scale = 4): Promise<Uint8Array> {
  const { data } = qrMatrix(text);
  return matrixToPng(data, scale);
}

export function qrSvg(
  text: string,
  opts: { px?: number; dark?: string; light?: string } = {},
): string {
  const px = opts.px ?? 440;
  const dark = opts.dark ?? "#111111";
  const light = opts.light ?? "#ffffff";
  const { data, size } = encode(text, { ecc: "M", border: 4 });
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[y][x]) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${light}"/><path fill="${dark}" d="${path}"/></svg>`;
}
