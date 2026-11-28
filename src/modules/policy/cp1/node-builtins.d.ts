/** Minimal Node 22 declarations used only by isolated C-P1; no dependency change. */
declare module 'node:crypto' {
  export interface CHash { update(data: string|Uint8Array): CHash; digest(encoding:'hex'):string }
  export function createHash(algorithm:'sha256'):CHash;
}
declare module 'node:util' { export const types:{isProxy(value:unknown):boolean}; }
declare module 'node:fs' {
  export function readFileSync(path:URL):Uint8Array;
  export function statSync(path:URL):{size:number;isFile():boolean};
}
declare module 'node:process' { export const version:string; }
