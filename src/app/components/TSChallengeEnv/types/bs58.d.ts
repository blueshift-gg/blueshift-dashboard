declare function base(ALPHABET: string): base.BaseConverter;

declare namespace base {
  interface BaseConverter {
    encode(buffer: Uint8Array | number[]): string;
    decodeUnsafe(string: string): Uint8Array | undefined;
    decode(string: string): Uint8Array;
  }
}

declare const _default: base.BaseConverter;
export default _default;

export {};
