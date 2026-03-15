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
  Activity
} from 'lucide-react';
import { SBFParser } from './chronos/sbf_parser';

// real sbf bytecode example including lddw:
// 1. mov64 r1, 10
// 2. lddw r2, 0xdeadbeefdeadbeef (16 bytes)
// 3. add64 r2, r1
// 4. exit
const DEMO_HEX = 'b70100000a00000018020000efbeadde00000000deadbeef07120000000000009500000000000000';

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [instructions, setInstructions] = useState([]);

  // decode instructions on load
  useEffect(() => {
    const decoded = SBFParser.parse(DEMO_HEX);
    setInstructions(decoded);
  }, []);

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      {/* Top Navigation */}
      <header className="flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg neon-border">
            <RotateCcw className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              CHRONOS <span className="text-primary/80 font-mono text-sm ml-2">v0.1.0</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">TIME-TRAVEL SVM DEBUGGER</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            <span className="text-xs font-mono">ALPENGLOW: <span className="text-primary font-bold">READY</span></span>
          </div>
          <button className="bg-primary hover:bg-accent text-black px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-primary/20">
            CONNECT ENGINE
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left: Bytecode Stepper */}
        <section className="col-span-4 flex flex-col gap-4">
          <div className="glass-panel flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">SBF Bytecode</h2>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">DEMO_TX_01</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {instructions.map((inst, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer group
                    ${i === activeStep ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5'}
                  `}
                  onClick={() => setActiveStep(i)}
                >
                  <span className={`text-[10px] font-mono w-6 text-right ${i === activeStep ? 'text-primary' : 'text-slate-600'}`}>
                    {String(inst.index * 8).padStart(4, '0')}
                  </span>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <code className={`text-xs ${i === activeStep ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {inst.opName} r{inst.dst}{inst.opName.includes('mov') || inst.opName.includes('add') ? `, ${inst.src === 0 ? `0x${inst.imm.toString(16)}` : `r${inst.src}`}` : ''}
                    </code>
                    <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-500 uppercase">
                      raw: {inst.raw}
                    </span>
                  </div>
                  {i === activeStep && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border grid grid-cols-3 gap-2">
              <button 
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> REWIND
              </button>
              <button 
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-secondary text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Play className="w-4 h-4" /> PLAY
              </button>
              <button 
                onClick={() => setActiveStep(Math.min(instructions.length - 1, activeStep + 1))}
                className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors"
              >
                NEXT <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Center: Register & Memory State */}
        <section className="col-span-5 flex flex-col gap-6">
          <div className="glass-panel h-1/2 flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Machine Registers</h2>
            </div>
            <div className="flex-1 p-4 grid grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                <div key={r} className="flex flex-col gap-0.5 p-2 bg-white/5 rounded border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">r{r}</span>
                  <span className="text-sm font-mono text-primary font-bold">
                    0x0000000000000000
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel h-1/2 flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Instruction Detail</h2>
            </div>
            <div className="flex-1 p-4">
              {instructions[activeStep] ? (
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Mnemonic</p>
                    <p className="text-lg font-mono text-white">{instructions[activeStep].opName.toUpperCase()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-[9px] text-slate-500 uppercase">Input</p>
                      <p className="text-xs font-mono">r{instructions[activeStep].src}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-[9px] text-slate-500 uppercase">Immediate</p>
                      <p className="text-xs font-mono">0x{instructions[activeStep].imm.toString(16)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 text-primary/40 mb-2" />
                  <p className="text-slate-400 text-xs">Awaiting instruction data...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right: Security & Mutation */}
        <section className="col-span-3 flex flex-col gap-4">
          <div className="glass-panel flex-1 flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Security Shield</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[10px] text-red-400 font-extrabold uppercase mb-1">Alert: Signer Verification</p>
                <p className="text-xs text-red-200/70">Instruction #0048 fails to verify account ownership before mutation.</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg opacity-50">
                <p className="text-[10px] text-green-400 font-extrabold uppercase mb-1">Check: Integer Overflow</p>
                <p className="text-xs text-green-200/70">Safe math bounds verified for instruction #0056.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
              Built with Grit on 8GB
            </h3>
            <div className="space-y-2">
              <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>SYSTEM RAM</span>
                <span className="text-primary italic">3.6GB / 8GB</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(153,69,255,0.05)_0%,_transparent_50%)]" />
    </div>
  );
};

export default App;
