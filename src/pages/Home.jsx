import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Target, Layers, ArrowRight } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start gap-4 p-5 glass-card border border-white/10 bg-white/5 group hover:bg-white/10 transition-colors">
    <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:glow-cyan transition-all">
      <Icon size={20} />
    </div>
    <div className="space-y-1">
      <h3 className="text-white font-black italic tracking-tighter text-sm uppercase">{title}</h3>
      <p className="text-white/40 text-[10px] leading-relaxed font-mono uppercase tracking-[0.1em]">{desc}</p>
    </div>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 bg-[#0a0a0b]">
      {/* Cinematic Background Patterns */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] opacity-[0.07] pointer-events-none">
        <div className="absolute inset-0 rounded-full border-[1px] border-cyan-500 animate-[spin_80s_linear_infinite]" />
        <div className="absolute inset-[150px] rounded-full border-[1px] border-violet-500 animate-[spin_60s_linear_infinite_reverse]" />
        <div className="absolute inset-[300px] rounded-full border-[1px] border-white/10 animate-pulse" />
      </div>

      <div className="z-10 text-center max-w-5xl">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[9px] uppercase font-mono tracking-[0.4em] mb-12 shadow-[0_0_20px_rgba(0,242,255,0.05)]">
          <Zap size={10} className="fill-cyan-400 animate-pulse" /> Status: Propulsion v4.0 Active
        </div>

        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-glow mb-10 leading-[0.85] uppercase">
          Career <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-violet-500 drop-shadow-[0_0_15px_rgba(0,242,255,0.2)]">Intelligence</span>
        </h1>

        <p className="text-lg md:text-xl text-white/40 mb-16 max-w-3xl mx-auto font-mono uppercase tracking-[0.2em] leading-relaxed italic">
          Extrapolate potential. <span className="text-white/10">Defy professional gravity.</span> <br /> 
          <span className="text-cyan-400/50">The definitive AI-driven career propulsion system.</span>
        </p>

        <div className="flex flex-wrap justify-center gap-8 mb-24">
          <Link
            to="/register"
            className="group relative px-12 py-5 bg-cyan-500 text-black font-black uppercase italic tracking-[0.2em] text-sm hover:scale-105 transition-all overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-3">Initiate Launch <ArrowRight size={20} /></span>
            <div className="absolute top-0 -left-[100%] w-full h-full bg-white transition-all duration-300 group-hover:left-0" />
          </Link>
          <Link
            to="/login"
            className="px-12 py-5 border border-white/10 text-white font-black uppercase italic tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-all hover:scale-105"
          >
            Access Terminal
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-white/5 pt-16">
          <Feature icon={Target} title="Match Engine" desc="99.8% stability in sector sector sync." />
          <Feature icon={Layers} title="Neural Parsing" desc="Multi-vector resume extraction." />
          <Feature icon={Zap} title="Instant Telemetery" desc="Real-time professional diagnostics." />
        </div>
      </div>
    </div>
  );
};

export default Home;
