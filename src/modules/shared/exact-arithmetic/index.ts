/** CP-002A / A-P1. Pure arithmetic; no policy, persistence, I/O or domain side effects. */
export type ErrorCode = 'INVALID_TYPE' | 'INVALID_SHAPE' | 'RESOURCE_LIMIT' |
  'NONCANONICAL' | 'DOMAIN' | 'DIV_ZERO' | 'NON_INTEGRAL' | 'OUT_OF_RANGE';
export class ArithmeticError extends Error {
  constructor(public readonly code: ErrorCode, detail: string) {
    super(detail); this.name = 'ArithmeticError';
  }
}
export interface RationalWire { readonly numerator: string; readonly denominator: string }
export type TieMode = 'positive' | 'negative' | 'toward_zero' | 'away_from_zero' | 'even';
export type Rounding = { readonly method: 'exact' } |
  { readonly method: 'floor' | 'ceil'; readonly quantum: RationalWire } |
  { readonly method: 'nearest'; readonly quantum: RationalWire; readonly tie: TieMode };
export type MassUnit = 'g' | 'kg';
type Pair = readonly [bigint, bigint];
type Tokens = readonly [string, string];
export const PROFILE = Object.freeze({ tokenDigits: 256, reducedDigits: 256, temporaryDigits: 1024 });
const REDUCED_MAX = 10n ** 256n - 1n;
const TEMP_MAX = 10n ** 1024n - 1n;
const NUMERIC78_MAX = 10n ** 78n - 1n;
const MIN64 = -9223372036854775808n, MAX64 = 9223372036854775807n;
const abs = (v: bigint): bigint => v < 0n ? -v : v;
function fail(code: ErrorCode, detail: string): never { throw new ArithmeticError(code, detail); }
function stringToken(v: unknown): string {
  if (typeof v !== 'string') fail('INVALID_TYPE', 'Expected decimal string');
  return v;
}
function tokenLimit(s: string): void {
  if (s.length - (s.startsWith('-') ? 1 : 0) > PROFILE.tokenDigits)
    fail('RESOURCE_LIMIT', 'Integer token exceeds A-P1 limit');
}
function grammar(s: string): void {
  // (?![\s\S]) enforces absolute end, unlike JavaScript $ before a final LF.
  if (!/^(?:0|-?[1-9][0-9]*)(?![\s\S])/.test(s))
    fail('NONCANONICAL', 'Expected canonical ASCII integer');
}
export function parseInteger(value: unknown): bigint {
  const s = stringToken(value); tokenLimit(s); grammar(s); return BigInt(s);
}
export function serializeInteger(value: unknown): string {
  if (typeof value !== 'bigint') fail('INVALID_TYPE', 'Expected bigint');
  reduced(value); return value.toString();
}
/** Plain, own, enumerable data fields only. Raw JSON/proxy validation is external. */
function dataRecord(value: unknown, permitted: readonly string[]): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    fail('INVALID_TYPE', 'Expected plain data object');
  const proto: unknown = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) fail('INVALID_SHAPE', 'Not a plain record');
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  // Stop at first disallowed key. A caller must supply bounded validated plain records.
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || !permitted.includes(key)) fail('INVALID_SHAPE', 'Unexpected field');
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (!d || !d.enumerable || !('value' in d)) fail('INVALID_SHAPE', 'Expected enumerable data field');
    result[key] = d.value;
  }
  return result;
}
function exactKeys(record: Record<string, unknown>, required: readonly string[]): void {
  if (Object.keys(record).length !== required.length || required.some(k => !Object.hasOwn(record, k)))
    fail('INVALID_SHAPE', 'Missing or unexpected field');
}
function tokens(value: unknown): Tokens {
  const r = dataRecord(value, ['numerator', 'denominator']);
  exactKeys(r, ['numerator', 'denominator']);
  return [stringToken(r.numerator), stringToken(r.denominator)];
}
function gcd(a: bigint, b: bigint): bigint {
  a = abs(a); b = abs(b);
  while (b !== 0n) { const r = a % b; a = b; b = r; }
  return a;
}
function temporary(v: bigint): bigint {
  if (abs(v) > TEMP_MAX) fail('RESOURCE_LIMIT', 'Temporary integer exceeds A-P1 limit');
  return v;
}
function reduced(v: bigint): bigint {
  if (abs(v) > REDUCED_MAX) fail('RESOURCE_LIMIT', 'Reduced component exceeds A-P1 limit');
  return v;
}
function mulInt(a: bigint, b: bigint): bigint { return temporary(a * b); }
function addInt(a: bigint, b: bigint): bigint { return temporary(a + b); }
function wire(n: bigint, d: bigint): RationalWire {
  return Object.freeze({ numerator: reduced(n).toString(), denominator: reduced(d).toString() });
}
function finish(n: bigint, d: bigint): RationalWire {
  temporary(n); temporary(d);
  if (d === 0n) fail('DIV_ZERO', 'Zero denominator');
  if (d < 0n) { n = -n; d = -d; }
  if (n === 0n) return wire(0n, 1n);
  const g = gcd(n, d); return wire(n / g, d / g);
}
// Validate all operands phase by phase before arithmetic. Shape/token types are read first.
function parsed(all: readonly Tokens[], normalize = false): Pair[] {
  for (const p of all) for (const s of p) tokenLimit(s);
  for (const p of all) for (const s of p) grammar(s);
  const pairs: Pair[] = all.map(p => [BigInt(p[0]), BigInt(p[1])]);
  for (const [, d] of pairs) {
    if (d === 0n) fail('DIV_ZERO', 'Zero denominator');
    if (!normalize && d < 0n) fail('DOMAIN', 'Denominator must be positive');
  }
  if (!normalize) for (const [n, d] of pairs)
    if (gcd(n, d) !== 1n) fail('NONCANONICAL', 'Wire fraction must be reduced (zero is 0/1)');
  return pairs;
}
function one(a: unknown): Pair { return parsed([tokens(a)])[0]!; }
function two(a: unknown, b: unknown): readonly [Pair, Pair] {
  const pairs = parsed([tokens(a), tokens(b)]); return [pairs[0]!, pairs[1]!];
}
export function parseRational(value: unknown): RationalWire { const [n, d] = one(value); return wire(n, d); }
/** Explicit normalization adapter. Tokens still must use canonical integer grammar. */
export function normalizeRational(value: unknown): RationalWire {
  const [n, d] = parsed([tokens(value)], true)[0]!; return finish(n, d);
}
export function fromInteger(value: unknown): RationalWire { return wire(parseInteger(value), 1n); }
function addPairs(a: Pair, b: Pair, subtract: boolean): RationalWire {
  const [n, d] = a, [m, e] = b, g = gcd(d, e);
  const left = mulInt(n, e / g), right = mulInt(m, d / g);
  return finish(addInt(left, subtract ? -right : right), mulInt(d / g, e));
}
export function add(a: unknown, b: unknown): RationalWire { const [x, y] = two(a, b); return addPairs(x, y, false); }
export function subtract(a: unknown, b: unknown): RationalWire { const [x, y] = two(a, b); return addPairs(x, y, true); }
/** Cross-cancel numerator against opposite denominator before multiplication. */
function product(a: Pair, b: Pair): Pair {
  const [n, d] = a, [m, e] = b;
  const g = gcd(n, e), h = gcd(m, d);
  return [mulInt(n / g, m / h), mulInt(d / h, e / g)];
}
function quotient(a: Pair, b: Pair): Pair {
  const [m, e] = b;
  if (m === 0n) fail('DIV_ZERO', 'Division by zero');
  return product(a, m < 0n ? [-e, -m] : [e, m]);
}
export function multiply(a: unknown, b: unknown): RationalWire {
  const [x, y] = two(a, b); return finish(...product(x, y));
}
export function divide(a: unknown, b: unknown): RationalWire {
  const [x, y] = two(a, b); return finish(...quotient(x, y));
}
/** The only Number result is a comparator sign, not a quantity. */
export function compare(a: unknown, b: unknown): -1 | 0 | 1 {
  const [[n, d], [m, e]] = two(a, b), g = gcd(d, e);
  const l = mulInt(n, e / g), r = mulInt(m, d / g);
  return l < r ? -1 : l > r ? 1 : 0;
}
export function convertMass(value: unknown, from: unknown, to: unknown): RationalWire {
  const t = tokens(value);
  if (typeof from !== 'string' || typeof to !== 'string') fail('INVALID_TYPE', 'Expected explicit mass units');
  const x = parsed([t])[0]!;
  if ((from !== 'g' && from !== 'kg') || (to !== 'g' && to !== 'kg')) fail('DOMAIN', 'Unsupported mass unit');
  if (from === to) return wire(...x);
  return finish(...product(x, from === 'kg' ? [1000n, 1n] : [1n, 1000n]));
}
function floorParts(n: bigint, d: bigint): Pair {
  // d > 0. BigInt division truncates, so adjust negative non-integral values.
  let k = n / d, r = n % d;
  if (r < 0n) { k = temporary(k - 1n); r = temporary(r + d); }
  return [k, r];
}
function isTie(v: unknown): v is TieMode {
  return v === 'positive' || v === 'negative' || v === 'toward_zero' || v === 'away_from_zero' || v === 'even';
}
export function round(value: unknown, options: unknown): RationalWire {
  const x = tokens(value);
  const o = dataRecord(options, ['method', 'quantum', 'tie']);
  if (!Object.hasOwn(o, 'method')) fail('INVALID_SHAPE', 'Missing rounding method');
  if (typeof o.method !== 'string') fail('INVALID_TYPE', 'Expected rounding method string');
  const method = o.method;
  if (method === 'exact') exactKeys(o, ['method']);
  else if (method === 'floor' || method === 'ceil') exactKeys(o, ['method', 'quantum']);
  else if (method === 'nearest') exactKeys(o, ['method', 'quantum', 'tie']);
  const qt = Object.hasOwn(o, 'quantum') ? tokens(o.quantum) : undefined;
  if (Object.hasOwn(o, 'tie') && typeof o.tie !== 'string') fail('INVALID_TYPE', 'Expected explicit tie string');
  const p = parsed(qt ? [x, qt] : [x]);
  const a = p[0]!;
  if (method === 'exact') return wire(...a);
  if (method !== 'floor' && method !== 'ceil' && method !== 'nearest') fail('DOMAIN', 'Unsupported rounding method');
  const q = p[1]!;
  if (q[0] <= 0n) fail('DOMAIN', 'Quantum must be positive');
  const tie = o.tie;
  if (method === 'nearest' && !isTie(tie)) fail('DOMAIN', 'Unsupported tie mode');
  const [n, d] = quotient(a, q); // internal ratio may exceed 256 digits; not a wire result
  const [k, r] = floorParts(n, d);
  let i = k;
  if (method === 'ceil' && r !== 0n) i = temporary(k + 1n);
  if (method === 'nearest') {
    const twice = mulInt(2n, r);
    if (twice > d) i = temporary(k + 1n);
    else if (twice === d) {
      const upper = tie === 'positive' || (tie === 'toward_zero' && n < 0n) ||
        (tie === 'away_from_zero' && n >= 0n) || (tie === 'even' && k % 2n !== 0n);
      if (upper) i = temporary(k + 1n);
    }
  }
  return finish(...product([i, 1n], q));
}
function integral(value: unknown): bigint {
  const [n, d] = one(value);
  if (d !== 1n) fail('NON_INTEGRAL', 'Integer export requires denominator 1');
  return n;
}
export function toSigned64(value: unknown): string {
  const n = integral(value);
  if (n < MIN64 || n > MAX64) fail('OUT_OF_RANGE', 'Outside signed 64-bit range');
  return n.toString();
}
function numeric78(n: bigint): string {
  if (abs(n) > NUMERIC78_MAX) fail('OUT_OF_RANGE', 'Outside numeric(78,0) magnitude');
  return n.toString();
}
/** Pure integer pre-cast checks; no driver, SQL or actual persistence. */
export function toNumeric78(value: unknown): string { return numeric78(integral(value)); }
export function toNumeric78Components(value: unknown): RationalWire {
  const [n, d] = one(value);
  return Object.freeze({ numerator: numeric78(n), denominator: numeric78(d) });
}
