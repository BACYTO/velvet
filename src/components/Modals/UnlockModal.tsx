import React from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { Video, TIER_COSTS } from '../../types';

interface UnlockModalProps {
  video: Video;
  userPoints: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function UnlockModal({ video, userPoints, onClose, onConfirm }: UnlockModalProps) {
  const cost = TIER_COSTS[video.tier];
  const canAfford = userPoints >= cost;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative liquid-glass w-full max-w-[400px] p-12 rounded-[40px] text-center border-[#ffffff1a]"
      >
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
          <Lock size={32} className="text-gold" />
        </div>
        <h2 className="font-display text-3xl mb-2 -tracking-[1px] font-bold">Desbloquear</h2>
        <p className="text-sm opacity-40 mb-8 px-4 font-medium">{video.title}</p>
        
        <div className="mb-10">
          <div className="text-5xl font-black text-gold mb-1 tracking-tighter">{cost}</div>
          <div className="text-[10px] opacity-30 uppercase tracking-[4px] font-bold">PUNTOS NECESARIOS</div>
        </div>

        <div className="space-y-4">
          <button 
            disabled={!canAfford}
            onClick={onConfirm}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${
              canAfford ? 'bg-primary hover:scale-[1.02] text-white' : 'bg-white/5 text-[#ffffff1a] cursor-not-allowed border border-white/5'
            }`}
          >
            {canAfford ? 'Confirmar Compra' : `Puntos Insuficientes (-${cost - userPoints})`}
          </button>
          <button onClick={onClose} className="w-full py-2 text-xs font-bold opacity-30 uppercase tracking-widest hover:opacity-60 transition-opacity">Cancelar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
