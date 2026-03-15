/**
 * sbf instruction set constants for solana.
 * these codes represent the raw machine language of the svm.
 * we use these to translate hex numbers into human words.
 */

export const OPCODES = {
  // basic math
  0x04: "add32",
  0x07: "add64",
  0x14: "sub32",
  0x17: "sub64",
  0x1c: "mul32",
  0x1f: "mul64",
  0x24: "div32",
  0x27: "div64",
  
  // memory and registers
  0xb4: "mov32",
  0xb7: "mov64",
  0x18: "lddw", // load double word (8 bytes)
  0x61: "ldxw", // load from memory
  0x63: "stxw", // store to memory
  
  // control flow
  0x85: "call", // call a program (like token or system)
  0x95: "exit", // end of program
  
  // comparisons
  0x35: "jge", // jump if greater or equal
  0x15: "jeq", // jump if equal
  0x25: "jgt", // jump if greater
  0x55: "jne", // jump if not equal
};

/**
 * helper to get name from raw code.
 * if code is unknown, we return the hex value.
 */
export const getOpName = (code) => {
  return OPCODES[code] || `unknown (0x${code.toString(16)})`;
};
