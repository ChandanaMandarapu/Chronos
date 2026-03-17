/**
 * stepper.js
 * the "rewind brain" of chronos.
 * it manages a list of state snapshots (temporal buffer).
 */

export class ChronosStepper {
  constructor(instructions) {
    this.instructions = instructions;
    this.currentIndex = 0;
    this.isMutated = false;
    
    // the history book: stores snapshots of [registers, pc, status]
    this.history = [];
    
    // initial machine state (11 registers + instruction pointer)
    this.state = {
      registers: new BigUint64Array(11),
      pc: 0,
    };

    // record the starting point (Step 0)
    this.recordSnapshot(0);
  }

  /**
   * take a copy of the current machine state.
   */
  recordSnapshot(pc) {
    this.history.push({
      registers: new BigUint64Array(this.state.registers),
      pc: pc,
      instruction: this.instructions[pc]
    });
  }

  /**
   * move forward one instruction.
   */
  stepForward() {
    if (this.currentIndex < this.instructions.length - 1) {
      // 1. Execute the current instruction
      this.simulateExecution(this.instructions[this.currentIndex]);
      
      // 2. Increment pointer
      this.currentIndex++;
      this.state.pc = this.currentIndex;
      
      // 3. Record the result for the EXECUTED position
      this.recordSnapshot(this.currentIndex - 1);
      return true;
    }
    return false;
  }

  /**
   * mock execution for demo purposes.
   * in Phase 2, this will be replaced by a real WASM-based SVM.
   */
  simulateExecution(inst) {
    const { opName, dst, src, imm } = inst;
    
    // simple mock logic for basic opcodes
    if (opName === "mov64") {
      this.state.registers[dst] = src === 0 ? imm : this.state.registers[src];
    } else if (opName === "add64") {
      const val = src === 0 ? imm : this.state.registers[src];
      this.state.registers[dst] = this.state.registers[dst] + val;
    } else if (opName === "sub64") {
      const val = src === 0 ? imm : this.state.registers[src];
      this.state.registers[dst] = this.state.registers[dst] - val;
    } else if (opName === "and64") {
      const val = src === 0 ? imm : this.state.registers[src];
      this.state.registers[dst] = this.state.registers[dst] & val;
    } else if (opName === "or64") {
      const val = src === 0 ? imm : this.state.registers[src];
      this.state.registers[dst] = this.state.registers[dst] | val;
    } else if (opName === "lddw") {
      this.state.registers[dst] = imm;
    } else if (opName === "exit") {
      // haling logic could go here
    }
  }

  /**
   * move backward by restoring the previous snapshot.
   * this is the "Time-Travel" logic.
   */
  stepBackward() {
    if (this.history.length > 1) {
      // remove the current "now"
      this.history.pop();
      
      // restore to the previous "now"
      const lastState = this.history[this.history.length - 1];
      this.state.registers = new BigUint64Array(lastState.registers);
      this.state.pc = lastState.pc;
      this.currentIndex = lastState.pc;
      
      return true;
    }
    return false;
  }

  getCurrentState() {
    return this.history[this.history.length - 1];
  }

  /**
   * inject a new value into the machine state.
   * this is the "Paradox Resolver" - it allows changing history.
   */
  mutateState(regIndex, newValue) {
    if (regIndex >= 0 && regIndex < 11) {
      try {
        // 1. Update the register
        this.state.registers[regIndex] = BigInt(newValue);
        this.isMutated = true;
        
        // 2. "Split the Timeline"
        // Remove all snapshots after the current instruction
        this.history = this.history.filter(h => h.pc <= this.currentIndex);
        
        // 3. Update the current snapshot with the mutated value
        const currentSnap = this.history[this.history.length - 1];
        if (currentSnap) {
          currentSnap.registers = new BigUint64Array(this.state.registers);
        }
        
        return true;
      } catch (e) {
        console.error("Invalid Paradox Injection:", e);
        return false;
      }
    }
    return false;
  }

  /**
   * check if the engine has moved from its original path.
   */
  isParadoxActive() {
    return this.isMutated;
  }
}
