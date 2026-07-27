// Minimal QR Code encoder — Versions 2–4, error-correction level L, byte mode,
// mask 0. Returns a square boolean matrix (true = dark module).
//
// Scope is deliberately narrow: these versions all use a single Reed–Solomon
// block at level L and exactly one alignment pattern (centred at SIZE-7), which
// keeps the placement logic simple. Version 4 holds 78 bytes — far more than the
// `${origin}/remote#CODE` URLs this encodes. Longer input throws rather than
// silently emitting a corrupt symbol.

type Spec = { version: number; size: number; dataCw: number; ecCw: number };

const SPECS: Spec[] = [
  { version: 2, size: 25, dataCw: 34, ecCw: 10 },
  { version: 3, size: 29, dataCw: 55, ecCw: 15 },
  { version: 4, size: 33, dataCw: 80, ecCw: 20 },
];

// 4 bits mode + 8 bits character count + 4 bits terminator = 2 codewords.
const HEADER_CW = 2;

const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
{
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v = (v << 1) ^ (v > 127 ? 0x11d : 0);
  }
  EXP[255] = 1;
}

function gfMul(a: number, b: number) {
  return a && b ? EXP[(LOG[a] + LOG[b]) % 255] : 0;
}

function polyMul(p1: number[], p2: number[]) {
  const r = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++)
    for (let j = 0; j < p2.length; j++) r[i + j] ^= gfMul(p1[i], p2[j]);
  return r;
}

function rsEncode(data: number[], ecCw: number) {
  let gen: number[] = [1];
  for (let i = 0; i < ecCw; i++) gen = polyMul(gen, [1, EXP[i]]);
  const msg = [...data, ...new Array(ecCw).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const c = msg[i];
    if (c) for (let j = 1; j < gen.length; j++) msg[i + j] ^= gfMul(gen[j], c);
  }
  return msg.slice(data.length);
}

function pickSpec(byteLen: number): Spec {
  const spec = SPECS.find((s) => byteLen <= s.dataCw - HEADER_CW);
  if (!spec) {
    const max = SPECS[SPECS.length - 1].dataCw - HEADER_CW;
    throw new RangeError(`QR payload too long: ${byteLen} bytes (max ${max})`);
  }
  return spec;
}

function encodeData(bytes: Uint8Array, spec: Spec): number[] {
  const bits: number[] = [];
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, 8); // character count (8 bits for versions 1–9)
  for (const b of bytes) push(b, 8);
  push(0, 4); // terminator
  while (bits.length % 8) bits.push(0);

  const cws: number[] = [];
  for (let i = 0; i < bits.length; i += 8)
    cws.push(bits.slice(i, i + 8).reduce((a, b, j) => a | (b << (7 - j)), 0));

  const pads = [0xec, 0x11];
  let pi = 0;
  while (cws.length < spec.dataCw) cws.push(pads[pi++ & 1]);
  return cws;
}

function setFinder(m: boolean[][], size: number, r: number, c: number) {
  for (let dr = -1; dr <= 7; dr++)
    for (let dc = -1; dc <= 7; dc++) {
      const rr = r + dr,
        cc = c + dc;
      if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) {
        m[rr][cc] = false;
        continue;
      }
      m[rr][cc] =
        dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
    }
}

function setAlign(m: boolean[][], align: number) {
  for (let dr = -2; dr <= 2; dr++)
    for (let dc = -2; dc <= 2; dc++)
      m[align + dr][align + dc] =
        Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
}

export function encodeQR(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const spec = pickSpec(bytes.length);
  const { size, ecCw } = spec;
  const align = size - 7;

  const data = encodeData(bytes, spec);
  const all = [...data, ...rsEncode(data, ecCw)];

  const m: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  const reserve = (r: number, c: number) => {
    if (r >= 0 && r < size && c >= 0 && c < size) reserved[r][c] = true;
  };

  const isFixed = (r: number, c: number): boolean => {
    if (r < 8 && c < 8) return true; // top-left finder + separator
    if (r < 8 && c >= size - 8) return true; // top-right
    if (r >= size - 8 && c < 8) return true; // bottom-left
    if (r === 6 || c === 6) return true; // timing
    if (Math.abs(r - align) <= 2 && Math.abs(c - align) <= 2) return true; // alignment
    if (r === size - 8 && c === 8) return true; // dark module
    if (r === 8 && (c < 9 || c >= size - 8)) return true; // format info
    if (c === 8 && (r < 9 || r >= size - 8)) return true;
    return false;
  };

  setFinder(m, size, 0, 0);
  setFinder(m, size, 0, size - 7);
  setFinder(m, size, size - 7, 0);
  setAlign(m, align);

  // Finders + separators
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      reserve(i, j);
      reserve(i, size - 8 + j);
      reserve(size - 8 + i, j);
    }
  // Alignment
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) reserve(align + dr, align + dc);

  // Timing
  for (let i = 8; i < size - 8; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
    reserve(6, i);
    reserve(i, 6);
  }

  // Dark module
  m[size - 8][8] = true;
  reserve(size - 8, 8);

  // Format info areas
  for (let i = 0; i < 9; i++) {
    reserve(8, i);
    reserve(i, 8);
  }
  for (let i = 0; i < 8; i++) {
    reserve(8, size - 8 + i);
    reserve(size - 8 + i, 8);
  }

  // Data placement, zigzag from bottom-right
  let bitIdx = 0;
  const totalBits = all.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    const col = right === 6 ? right - 1 : right; // skip the vertical timing column
    if (col < 0) break;
    const upward = ((size - 1 - col) >> 1) % 2 === 0;
    for (let step = 0; step < size; step++) {
      const row = upward ? size - 1 - step : step;
      for (let dc = 0; dc <= 1; dc++) {
        const c = col - dc;
        if (c < 0 || reserved[row][c]) continue;
        if (bitIdx < totalBits) {
          const byte = all[bitIdx >> 3];
          m[row][c] = ((byte >> (7 - (bitIdx & 7))) & 1) === 1;
          bitIdx++;
        }
        reserved[row][c] = true;
      }
    }
  }

  // Mask 0: invert where (row + col) % 2 === 0, data modules only
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (reserved[r][c] && !isFixed(r, c) && (r + c) % 2 === 0) m[r][c] = !m[r][c];

  // Format info: level L + mask 0, BCH(15,5) encoded and XOR-masked. Written
  // after masking, since format modules are never masked.
  const fmt = 0b111011111000100;
  for (let i = 0; i < 15; i++) {
    const bit = ((fmt >> (14 - i)) & 1) === 1;
    // Copy 1 — around the top-left finder
    if (i < 6) m[8][i] = bit;
    else if (i === 6) m[8][7] = bit;
    else if (i === 7) m[8][8] = bit;
    else if (i === 8) m[7][8] = bit;
    else m[14 - i][8] = bit;
    // Copy 2 — split across the other two finders
    if (i < 8) m[size - 1 - i][8] = bit;
    else m[8][size - 15 + i] = bit;
  }

  return m;
}
