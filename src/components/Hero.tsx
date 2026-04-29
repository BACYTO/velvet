import React from 'react';
import { motion } from 'motion/react';
import { Play, Star } from 'lucide-react';
import { Video } from '../types';

interface HeroProps {
  video: Video;
  onPlay: () => void;
  openPoints: () => void;
}

export function Hero({ video, onPlay, openPoints }: HeroProps) {
  if (!video) return null;
  return (
    <div className="relative h-[80vh] w-full flex items-end px-6 sm:px-12 pb-16 sm:pb-24 overflow-hidden -mt-[72px]">
      <motion.div 
        key={video.id}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 z-[-1]"
        style={{ 
          background: video.bg.includes('url') ? `url(${video.bg.replace(/url\(['"]?(.+?)['"]?\)/, '$1')}) center/cover no-repeat` : video.bg
        }}
      />
      <div className="absolute inset-0 z-[-1] bg-gradient-to-t from-[#07050f] via-[#07050f]/20 to-transparent" />
      <div className="absolute inset-0 z-[-1] bg-gradient-to-r from-[#07050f] via-transparent to-transparent hidden sm:block" />
      
      <motion.div 
        key={`content-${video.id}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 backdrop-blur-md rounded-lg text-primary font-bold text-[10px] tracking-widest mb-6 border border-primary/20 shadow-lg shadow-primary/10">
          <Star size={12} fill="currentColor" />
          CONTENIDO DESTACADO
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl mb-6 leading-[1.05] font-black tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">{video.title}</h1>
        <div className="flex flex-wrap gap-4 text-[9px] sm:text-[10px] opacity-60 mb-8 font-black uppercase tracking-[3px]">
          <span className="bg-white/5 py-1 px-3 rounded-md">{video.dur}</span>
          <span className="bg-white/5 py-1 px-3 rounded-md">{video.views.toLocaleString()} vistas</span>
          <span className="bg-white/5 py-1 px-3 rounded-md">{video.cat}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onPlay} className="px-10 py-4 bg-gradient-to-r from-primary to-violet rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-primary/30 text-sm">
            <Play size={20} fill="white" />
            <span>EXAMINAR AHORA</span>
          </button>
          <button onClick={openPoints} className="px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl font-bold transition-all text-sm active:scale-95">
            MIS PUNTOS
          </button>
        </div>
      </motion.div>
    </div>
  );
}
