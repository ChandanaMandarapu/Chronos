import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import App from './App';

export default function Pitch({ onComplete }) {
  const [stage, setStage] = useState(1);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (skip) return;
    let timer;
    if (stage === 1) timer = setTimeout(() => setStage(2), 3500);
    else if (stage === 2) timer = setTimeout(() => setStage(3), 2000);
    else if (stage === 3) timer = setTimeout(() => setStage(4), 2500);
    else if (stage === 4) timer = setTimeout(() => setStage(5), 4000); 
    else if (stage === 5) timer = setTimeout(() => setStage(6), 4000);
    else if (stage === 6) timer = setTimeout(() => setStage(6.5), 4500);
    else if (stage === 6.5) timer = setTimeout(() => setStage(7), 4000);
    return () => clearTimeout(timer);
  }, [stage, skip]);

  if (skip || stage === 7) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex overflow-hidden">
        {/* Left Side: Real App scaled down slightly */}
        <div className="w-2/3 h-screen relative">
          <div className="transform scale-[0.85] origin-top-left w-[117%] h-[117%]">
             <App />
          </div>
          
          {/* TOOLTIPS: Guiding the user exactly as requested */}
          <div className="absolute top-[85px] left-[350px] animate-pulse flex items-center gap-2 z-50 pointer-events-none">
            <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#14f195]" />
            <span className="text-primary font-bold text-xs bg-black/80 px-2 py-1 border border-primary/30 rounded">1. Click NEXT to step through SBF bytecode</span>
          </div>

          <div className="absolute top-[400px] left-[550px] animate-pulse flex items-center gap-2 z-50 pointer-events-none">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
            <span className="text-red-400 font-bold text-xs bg-black/80 px-2 py-1 border border-red-500/30 rounded">2. Type '99' in any register to inject a Paradox</span>
          </div>
          
          <div className="absolute bottom-[200px] left-[150px] animate-pulse flex items-center gap-2 z-50 pointer-events-none">
            <div className="w-3 h-3 bg-secondary rounded-full shadow-[0_0_10px_#9945ff]" />
            <span className="text-secondary font-bold text-xs bg-black/80 px-2 py-1 border border-secondary/30 rounded">3. Watch Architect's Note for Context</span>
          </div>
        </div>

        {/* Right Side: Founder Story */}
        <div className="w-1/3 h-screen border-l border-white/10 bg-black/40 p-8 flex flex-col justify-center relative">
          <div className="scanline" />
          <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-widest neon-text">The Architect</h2>
          <div className="space-y-4 mb-12">
            <div className="glass-panel p-4 border-l-2 border-primary">
              <p className="text-sm font-bold text-white uppercase">Chandana Mandarapu</p>
              <p className="text-xs text-slate-400 font-mono mt-1">22 years old. Hyderabad, India.</p>
            </div>
            <div className="glass-panel p-4 border-l-2 border-primary/60">
              <p className="text-sm font-bold text-white uppercase">The Setup</p>
              <p className="text-xs text-slate-400 font-mono mt-1">8GB ThinkPad. Zero Budget.</p>
            </div>
            <div className="glass-panel p-4 border-l-2 border-red-500/60">
              <p className="text-sm font-bold text-white uppercase">The Fuel</p>
              <p className="text-xs text-slate-400 font-mono mt-1">Rejected twice. Kept building.</p>
            </div>
            <div className="glass-panel p-4 border-l-2 border-secondary/60">
              <p className="text-sm font-bold text-white uppercase">The Impact</p>
              <p className="text-xs text-slate-400 font-mono mt-1">Built the world's first browser-based Time-Travel SVM engine.</p>
            </div>
          </div>
          <a href="#" className="w-full py-4 bg-primary text-black font-bold text-center rounded-lg hover:bg-primary/90 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)] flex items-center justify-center gap-2">
            Submit Application <Zap className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Render Stages 1 to 6.5
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center relative overflow-hidden">
      <button onClick={() => setSkip(true)} className="absolute top-6 right-6 text-xs font-bold text-slate-500 hover:text-white glass-panel px-4 py-2 z-50 transition-colors">
        SKIP INTRO →
      </button>

      {stage === 1 && (
        <div className="text-center w-full max-w-3xl px-6">
           <h1 className="text-2xl md:text-3xl font-mono text-white typewriter inline-block">
             Every Solana hack started with one instruction.
           </h1>
           <p className="text-sm md:text-xl text-slate-500 font-mono mt-6 typewriter opacity-0" style={{animationDelay: '1.5s', animationFillMode: 'forwards'}}>
             Developers had no way to see it happen live.
           </p>
        </div>
      )}

      {stage === 2 && (
        <div className="w-full h-full absolute inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center opacity-70">
           <pre className="text-[10px] md:text-xs text-green-900 overflow-hidden w-full h-full opacity-30 leading-none break-all">
             {Array(100).fill("0x14 0x64 0x00 0x82 0xFF 0x1A 0x2B 0x3C 0x4D 0x5E ").join("")}
           </pre>
           <div className="absolute bg-black/80 px-6 py-4 border border-red-500/30">
             <h2 className="text-red-500 font-mono uppercase tracking-widest text-lg">This is how we debug today.</h2>
           </div>
        </div>
      )}

      {stage === 3 && (
        <div className="flex flex-col items-center glitch-effect">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(20,241,149,0.3)] mb-8">
              <RotateCcw className="text-black w-12 h-12" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white mb-4 neon-text uppercase">
              CHRONOS
            </h1>
            <p className="text-sm text-primary font-mono tracking-[0.3em] uppercase">World's First In-Browser SBF Debugger</p>
        </div>
      )}

      {(stage === 4 || stage === 5) && (
        <div className="w-full max-w-4xl h-[60vh] glass-panel border-primary/20 relative overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
             <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-primary"/><span className="font-bold text-xs uppercase">Auto-Simulation Active</span></div>
             {stage === 5 && <span className="text-red-500 font-bold text-[10px] animate-pulse tracking-widest uppercase border border-red-500/30 px-2 py-1 rounded">Paradox Live</span>}
          </div>
          <div className="flex-1 flex items-center justify-center relative">
             <div className="absolute inset-0 scanline" />
             {stage === 5 && <div className="absolute inset-0 bg-red-500/10 z-10 animate-pulse"/>}
             
             {stage === 4 ? (
               <div className="text-center">
                 <h2 className="text-2xl font-mono text-white mb-4">Simulating Mango Exploit...</h2>
                 <p className="text-primary font-mono text-sm opacity-80">Stepping: 0016: add64 r2, r1</p>
               </div>
             ) : (
               <div className="text-center z-20 glitch-effect">
                 <h2 className="text-3xl font-bold text-red-500 mb-4 uppercase tracking-widest">God Mode Activated</h2>
                 <p className="text-white font-mono text-sm">Timeline Split: Register Data Injected</p>
               </div>
             )}
          </div>
        </div>
      )}

      {stage === 6 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl px-6 w-full">
           <div className="glass-panel p-8 text-center border-t-2 border-primary">
             <RotateCcw className="w-12 h-12 text-primary mx-auto mb-6" />
             <h3 className="font-bold text-white uppercase text-lg mb-2">Temporal Buffer</h3>
             <p className="text-xs text-slate-400 font-mono">150ms snapshot memory. Rewind transactions infinitely.</p>
           </div>
           <div className="glass-panel p-8 text-center border-t-2 border-red-500">
             <Zap className="w-12 h-12 text-red-500 mx-auto mb-6" />
             <h3 className="font-bold text-white uppercase text-lg mb-2">Paradox Resolver</h3>
             <p className="text-xs text-slate-400 font-mono">Live state mutation. Edit registers, split the timeline, change the future.</p>
           </div>
           <div className="glass-panel p-8 text-center border-t-2 border-secondary">
             <Shield className="w-12 h-12 text-secondary mx-auto mb-6" />
             <h3 className="font-bold text-white uppercase text-lg mb-2">Zero-Cost Scaling</h3>
             <p className="text-xs text-slate-400 font-mono">Runs entirely client-side. No RPC nodes. {`<1GB`} RAM usage.</p>
           </div>
        </div>
      )}

      {stage === 6.5 && (
        <div className="text-center">
           <p className="text-secondary font-bold uppercase tracking-[0.3em] mb-4 text-xs">The Foundation Roadmap</p>
           <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-6">Phase 2: Hybrid Stack</h2>
           <div className="glass-panel px-8 py-4 inline-flex items-center gap-4 border-white/20">
             <span className="text-lg font-mono text-slate-300">WASM Core</span>
             <ArrowRight className="text-primary w-5 h-5" />
             <span className="text-lg font-mono text-primary">Ultra-Fast 150ms Finality</span>
           </div>
        </div>
      )}
    </div>
  );
}
