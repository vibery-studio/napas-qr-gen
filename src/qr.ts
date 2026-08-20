import { encode } from "uqr";

export function qrSvg(text: string, px = 440): string {
  const { data, size } = encode(text, { ecc: "M", border: 4 });
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[y][x]) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${px}" height="${px}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path fill="#111" d="${path}"/></svg>`;
}
