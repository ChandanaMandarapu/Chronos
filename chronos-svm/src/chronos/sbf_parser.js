/**
 * sbf_parser.js
 * this is the heart of our translator. 
 * it takes raw hex data and turns it into objects we can use.
 */

import { getOpName } from './instructions.js';

export class SBFParser {
  /**
   * parse a hex string into a list of instructions.
   * each instruction in solana (sbf) is 8 bytes long.
   */
  static parse(hexString) {
    const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
    const bytes = this.hexToBytes(cleanHex);
    const instructions = [];

    for (let i = 0; i < bytes.length; i += 8) {
      const chunk = bytes.slice(i, i + 8);
      if (chunk.length < 8) break;

      const opcode = chunk[0];
      const regs = chunk[1];
      const dst = regs & 0x0f;
      const src = (regs >> 4) & 0x0f;
      
      // offset is a signed 16-bit integer (little-endian)
      const offset = new Int16Array(new Uint8Array([chunk[2], chunk[3]]).buffer)[0];
      
      // standard immediate is a signed 32-bit integer
      const imm = new Int32Array(new Uint8Array([chunk[4], chunk[5], chunk[6], chunk[7]]).buffer)[0];

      let opName = getOpName(opcode);
      let fullImm = BigInt(imm);
      let isWide = false;

      // handle lddw (load double word) which is 16 bytes (two slots)
      if (opcode === 0x18) {
        const nextChunk = bytes.slice(i + 8, i + 16);
        if (nextChunk.length === 8) {
          // for lddw, we treat both 32-bit halves as raw bits (unsigned) before combining
          const lowImm = new Uint32Array(new Uint8Array([chunk[4], chunk[5], chunk[6], chunk[7]]).buffer)[0];
          const highImm = new Uint32Array(new Uint8Array([nextChunk[4], nextChunk[5], nextChunk[6], nextChunk[7]]).buffer)[0];
          
          fullImm = BigInt(lowImm) | (BigInt(highImm) << 32n);
          isWide = true;
        }
      }

      instructions.push({
        index: i / 8,
        opcode,
        opName,
        dst,
        src,
        offset,
        imm: fullImm,
        raw: Array.from(bytes.slice(i, i + (isWide ? 16 : 8))).map(b => b.toString(16).padStart(2, '0')).join(' ')
      });

      // skip the second half of the 16-byte instruction
      if (isWide) i += 8;
    }

    return instructions;
  }

  /**
   * helper to convert hex string to byte array
   */
  static hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
      bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
  }
}
