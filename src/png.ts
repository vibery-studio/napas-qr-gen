/** Minimal RGB PNG via CompressionStream (Workers + Node 18+). */

function crc32(buf: Uint8Array): number {
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) >>> 0 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n);
  return b;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const t = new TextEncoder().encode(type);
  const crcSrc = new Uint8Array(t.length + data.length);
  crcSrc.set(t, 0);
  crcSrc.set(data, t.length);
  const out = new Uint8Array(8 + data.length + 4);
  out.set(u32(data.length), 0);
  out.set(t, 4);
  out.set(data, 8);
  out.set(u32(crc32(crcSrc)), 8 + data.length);
  return out;
}

async function deflate(raw: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();
  await writer.write(raw);
  await writer.close();
  const parts: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    parts.push(value);
  }
  const len = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export async function matrixToPng(matrix: boolean[][], scale = 4): Promise<Uint8Array> {
  const size = matrix.length;
  const w = size * scale;
  const raw = new Uint8Array((w * 3 + 1) * w);
  let p = 0;
  for (let y = 0; y < w; y++) {
    raw[p++] = 0;
    const yy = Math.floor(y / scale);
    const row = matrix[yy];
    for (let x = 0; x < w; x++) {
      const v = row[Math.floor(x / scale)] ? 17 : 255;
      raw[p++] = v;
      raw[p++] = v;
      raw[p++] = v;
    }
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, w);
  dv.setUint32(4, w);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const idat = await deflate(raw);
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array(0))];
  const len = parts.reduce((n, x) => n + x.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const part of parts) {
    out.set(part, o);
    o += part.length;
  }
  return out;
}
