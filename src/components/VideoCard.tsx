import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Lock } from 'lucide-react';
import { Video, TIER_COSTS } from '../types';

interface VideoCardProps {
  video: Video;
  isUnlocked: boolean;
  onClick: () => void;
  key?: string | number;
}

export function VideoCard({ video, isUnlocked, onClick }: VideoCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer select-none"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden liquid-glass border-white/5 mb-3 transition-all duration-500 group-hover:border-white/20 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        {video.bg.includes('url') ? (
          <img 
            src={video.bg.replace(/url\(['"]?(.+?)['"]?\)/, '$1')} 
            alt={video.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div 
            className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110" 
            style={{ background: video.bg }} 
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        <div className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 ${
          video.tier === 'free' ? 'bg-green-500/80 text-white' : 
          video.tier === 'standard' ? 'bg-violet/80 text-white' :
          video.tier === 'premium' ? 'bg-primary/80 text-white' : 'bg-gold/80 text-black'
        }`}>
          {video.tier}
        </div>
        
        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white/90 border border-white/5 tracking-wider">
          {video.dur}
        </div>
        
        <AnimatePresence>
          {!isUnlocked ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-all duration-500"
            >
              <div className="w-11 h-11 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-gold shadow-2xl">
                <Lock size={20} />
              </div>
              <div className="px-4 py-1.5 rounded-full bg-violet/20 border border-violet/30 text-[10px] font-bold text-white uppercase tracking-[2px] animate-pulse">
                {TIER_COSTS[video.tier]} PTS
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-3xl border border-white/30 flex items-center justify-center scale-90 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                <Play size={24} fill="white" className="ml-1 text-white" />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-1">
        <h4 className="font-bold text-sm line-clamp-1 mb-1 tracking-tight text-white/90 group-hover:text-white transition-colors">{video.title}</h4>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
          <span>{video.views.toLocaleString()} VIEWS</span>
          <span className="text-violet">{video.cat}</span>
        </div>
      </div>
    </motion.div>
  );
}
