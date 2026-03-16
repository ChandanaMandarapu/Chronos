import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Terminal,
  Layers,
  Activity,
  Pause
} from 'lucide-react';
import { SBFParser } from './chronos/sbf_parser';
import { ChronosStepper } from './chronos/stepper';

const SCENARIOS = {
  DEMO: {
    name: "Standard SBF Demo",
    description: "Basic arithmetic and registers",
    hex: 'b70100000a00000018020000efbeadde00000000deadbeef07120000000000009500000000000000',
    alerts: [
      { type: 'check', title: 'Integer Overflow', text: 'Safe math bounds verified for instruction #0056.' }
    ]
  },
  MANGO: {
    name: "Mango Markets Exploit",
    description: "Oracle manipulation simulation",
    // Refining lddw encoding: 1803000000000000 (lddw r3, part1) + 0000000001000000 (part2)
    hex: 'b701000014000000b7020000640000000712000000000000180300000000000000000000010000009500000000000000',
    alerts: [
      { type: 'alert', title: 'Oracle Risk', text: 'Instruction #0012 detects unusual price variance in account snapshot.' },
      { type: 'alert', title: 'Missing Signer', text: 'Program fails to verify liquidity provider authority.' }
    ]
  }
};

const App = () => {
  const [activeScenario, setActiveScenario] = useState('DEMO');
  const [instructions, setInstructions] = useState([]);
  const [stepper, setStepper] = useState(null);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // load scenario
  useEffect(() => {
    setIsPlaying(false);
    const scenario = SCENARIOS[activeScenario];
    const decoded = SBFParser.parse(scenario.hex);
    setInstructions(decoded);
    
    const engine = new ChronosStepper(decoded);
    setStepper(engine);
    setCurrentSnapshot(engine.getCurrentState());
  }, [activeScenario]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowRight') handleNext();
      if (e.code === 'ArrowLeft') handleRewind();
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepper, instructions]);

  // Auto-play logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (stepper && stepper.currentIndex < instructions.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, stepper, instructions]);

  const handleNext = () => {
    if (stepper && stepper.stepForward()) {
      setCurrentSnapshot(stepper.getCurrentState());
    }
  };

  const handleRewind = () => {
    if (stepper && stepper.stepBackward()) {
      setCurrentSnapshot(stepper.getCurrentState());
    }
  };

  const activeStep = currentSnapshot ? currentSnapshot.pc : 0;
  const registers = currentSnapshot ? currentSnapshot.registers : new BigUint64Array(11);

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 terminal-grid selection:bg-primary selection:text-black">
      <div className="scanline" />
      
      {/* Top Navigation */}
      <header className="flex justify-between items-center px-4 relative z-20">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg neon-border transition-transform group-hover:scale-110">
            <RotateCcw className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight neon-text">
              CHRONOS <span className="text-primary/80 font-mono text-sm ml-2">v0.1.0</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-[0.2em]">TIME-TRAVEL SVM ENGINE</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {Object.keys(SCENARIOS).map(key => (
              <button
                key={key}
                onClick={() => setActiveScenario(key)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                  activeScenario === key 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {SCENARIOS[key].name.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="glass-panel px-4 py-2 flex items-center gap-2 border-primary/20">
            <Activity className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-xs font-mono">ALPENGLOW: <span className="text-primary font-bold">ACTIVE</span></span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden relative z-20">
        
        {/* Left: Bytecode Stepper */}
        <section className="col-span-4 flex flex-col gap-4">
          <div className="glass-panel flex-1 flex flex-col overflow-hidden border-white/5">
            <div className="p-4 border-b border-border flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">SBF Bytecode</h2>
              </div>
              <span className="text-[10px] bg-primary/10 px-2 py-1 rounded text-primary font-mono border border-primary/20 tracking-tighter">
                {activeScenario === 'MANGO' ? 'EXPLOIT_SIG_4T...7h' : 'DEMO_TX_01'}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {instructions.map((inst, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-md transition-all group relative overflow-hidden
                    ${i === activeStep ? 'bg-primary/10 border border-primary/30 pulse-primary' : 'hover:bg-white/5 border border-transparent'}
                  `}
                >
                  <span className={`text-[10px] font-mono w-6 text-right ${i === activeStep ? 'text-primary' : 'text-slate-600'}`}>
                    {String(inst.index * 8).padStart(4, '0')}
                  </span>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <code className={`text-xs ${i === activeStep ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {inst.opName} r{inst.dst}{inst.opName.includes('mov') || inst.opName.includes('add') ? `, ${inst.src === 0 ? `0x${inst.imm.toString(16)}` : `r${inst.src}`}` : ''}
                    </code>
                    <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-500 uppercase flex items-center gap-2">
                      <span className="opacity-50 tracking-tighter">RAW</span> {inst.raw}
                    </span>
                  </div>
                  {i === activeStep && (
                    <div className="absolute right-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(20,241,149,0.8)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border grid grid-cols-3 gap-2 bg-black/20">
              <button 
                onClick={handleRewind}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-all active:scale-95 disabled:opacity-30"
                disabled={!currentSnapshot || activeStep === 0}
              >
                <ArrowLeft className="w-4 h-4" /> REWIND
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-white text-xs font-bold transition-all active:scale-95 ${
                  isPlaying ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-secondary hover:shadow-[0_0_15px_rgba(153,69,255,0.4)]'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button 
                onClick={handleNext}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-all active:scale-95 disabled:opacity-30"
                disabled={activeStep === instructions.length - 1}
              >
                NEXT <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Center: Register & Memory State */}
        <section className="col-span-5 flex flex-col gap-6">
          <div className="glass-panel h-1/2 flex flex-col border-white/5">
            <div className="p-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-secondary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Machine Registers</h2>
              </div>
              <span className="text-[9px] font-mono text-slate-500">SYSTEM: SVM_WASM_CORE</span>
            </div>
            <div className="flex-1 p-4 grid grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto custom-scrollbar">
              {Array.from({ length: 11 }).map((_, r) => (
                <div key={r} className={`flex flex-col gap-0.5 p-2 rounded border transition-all ${
                  instructions[activeStep]?.dst === r || instructions[activeStep]?.src === r
                  ? 'bg-primary/5 border-primary/20 shadow-[inset_0_0_10px_rgba(20,241,149,0.05)]'
                  : 'bg-white/5 border-white/5'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                    instructions[activeStep]?.dst === r ? 'text-primary' : 'text-slate-500'
                  }`}>r{r}</span>
                  <span className={`text-sm font-mono font-bold transition-all ${
                    instructions[activeStep]?.dst === r ? 'text-white' : 'text-primary'
                  }`}>
                    0x{registers[r].toString(16).padStart(16, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel h-1/2 flex flex-col border-white/5">
          <div className="p-4 border-b border-border flex items-center gap-2 bg-white/[0.02]">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Instruction Audit</h2>
            </div>
            <div className="flex-1 p-4 relative">
              {instructions[activeStep] ? (
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center group">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mnemonic</p>
                      <p className="text-xl font-mono text-white group-hover:text-primary transition-colors">{instructions[activeStep].opName.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Compute Units</p>
                      <p className="text-xs font-mono text-secondary">~ 1 CU</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-2 bg-white/5 rounded border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Registry Target</p>
                      <p className="text-xs font-mono text-white">r{instructions[activeStep].dst}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-bold">Immediate Data</p>
                      <p className="text-xs font-mono text-white opacity-80">
                        {instructions[activeStep].imm.toString().length > 10 
                          ? '0x' + instructions[activeStep].imm.toString(16)
                          : instructions[activeStep].imm.toString()
                        }
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-primary/5 rounded border border-primary/20">
                    <p className="text-[9px] text-primary uppercase font-bold mb-1 italic">Architect's Note</p>
                    <p className="text-[10px] text-slate-300 leading-relaxed italic">
                      This {instructions[activeStep].opName} operation modifies the program state. 
                      Chronos is tracking the mutation for temporal drift.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Activity className="w-8 h-8 text-primary mb-2" />
                  <p className="text-slate-400 text-xs">Awaiting instruction data...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right: Security Shield */}
        <section className="col-span-3 flex flex-col gap-4">
          <div className="glass-panel flex-1 flex flex-col border-white/5">
            <div className="p-4 border-b border-border flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Security Shield</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(20,241,149,1)]" />
            </div>
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
              {SCENARIOS[activeScenario].alerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-help ${
                    alert.type === 'alert' 
                    ? 'bg-red-500/10 border-red-500/30 shadow-[0_4px_12px_rgba(239,68,68,0.1)]' 
                    : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <p className={`text-[10px] font-extrabold uppercase mb-1 tracking-tighter ${
                    alert.type === 'alert' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {alert.type.toUpperCase()}: {alert.title}
                  </p>
                  <p className="text-[10px] text-slate-300 leading-normal font-medium">
                    {alert.text}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-3 tracking-widest text-center">Threat Landscape</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 p-2 rounded text-center border border-white/5">
                    <p className="text-[10px] text-white font-bold">100%</p>
                    <p className="text-[8px] text-slate-500 uppercase">Coverage</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded text-center border border-white/5">
                    <p className="text-[10px] text-primary font-bold">0ms</p>
                    <p className="text-[8px] text-slate-500 uppercase">Latency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Stats */}
          <div className="glass-panel p-5 border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <h3 className="text-[10px] font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-[0.3em] text-center w-full justify-center">
              Infrastructure Node
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-500">MEMORY_PRESSURE</span>
                  <span className="text-primary tracking-tighter">3.6GB / 8GB</span>
                </div>
                <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[45%] rounded-full shadow-[0_0_8px_rgba(20,241,149,0.5)]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-500">ENGINE_STABILITY</span>
                  <span className="text-secondary tracking-tighter">99.9%</span>
                </div>
                <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div className="h-full bg-gradient-to-r from-secondary to-accent w-[99.9%] rounded-full" />
                </div>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-slate-500 uppercase">
                Thinkpad x280
              </div>
              <div className="flex items-center gap-1.5 animate-pulse">
                <div className="w-1 h-1 rounded-full bg-primary" />
                <span className="text-[8px] text-primary font-bold uppercase tracking-widest">Architect Online</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Decorative Overlays */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_0%,_rgba(153,69,255,0.08)_0%,_transparent_50%)]" />
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_100%_100%,_rgba(20,241,149,0.05)_0%,_transparent_50%)]" />
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(153,69,255,0.05)_0%,_transparent_50%)]" />
    </div>
  );
};

export default App;
