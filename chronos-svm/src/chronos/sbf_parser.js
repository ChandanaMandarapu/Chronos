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
    // remove 0x if it exists and clean the string
    const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
    const bytes = this.hexToBytes(cleanHex);
    const instructions = [];

    // loop through bytes 8 at a time
    for (let i = 0; i < bytes.length; i += 8) {
      const chunk = bytes.slice(i, i + 8);
      if (chunk.length < 8) break;

      const opcode = chunk[0];
      const regs = chunk[1];
      const dst = regs & 0x0f; // first 4 bits
      const src = (regs >> 4) & 0x0f; // last 4 bits
      
      // offset is 2 bytes (big endian in sbf)
      const offset = (chunk[3] << 8) | chunk[2];
      
      // immediate value is 4 bytes
      const imm = (chunk[7] << 24) | (chunk[6] << 16) | (chunk[5] << 8) | chunk[4];

      instructions.push({
        index: i / 8,
        opcode,
        opName: getOpName(opcode),
        dst,
        src,
        offset,
        imm,
        raw: Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ')
      });
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
