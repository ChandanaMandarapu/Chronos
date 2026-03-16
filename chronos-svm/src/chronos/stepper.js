/**
 * stepper.js
 * the "rewind brain" of chronos.
 * it manages a list of state snapshots (temporal buffer).
 */

export class ChronosStepper {
  constructor(instructions) {
    this.instructions = instructions;
    this.currentIndex = 0;
    
    // the history book: stores snapshots of [registers, pc, status]
    this.history = [];
    
    // initial machine state (11 registers + instruction pointer)
    this.state = {
      registers: new BigUint64Array(11),
      pc: 0,
    };

    // record the starting point
    this.recordSnapshot();
  }

  /**
   * take a copy of the current machine state.
   */
  recordSnapshot() {
    this.history.push({
      registers: new BigUint64Array(this.state.registers),
      pc: this.state.pc,
      instruction: this.instructions[this.currentIndex]
    });
  }

  /**
   * move forward one instruction.
   * in a real VM, this would execute the math.
   * for day 2, we simulate the movement and state recording.
   */
  stepForward() {
    if (this.currentIndex < this.instructions.length - 1) {
      this.currentIndex++;
      this.state.pc = this.currentIndex;
      
      // record the new state
      this.recordSnapshot();
      return true;
    }
    return false;
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
}
