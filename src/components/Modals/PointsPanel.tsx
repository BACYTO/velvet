import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRightLeft, Coins, TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { UserProfile } from '../../types';

interface PointsPanelProps {
  user: UserProfile | null;
  close: () => void;
  onSwap?: (pts: number) => Promise<void>;
  systemConfig?: any;
}

export function PointsPanel({ close, user, onSwap, systemConfig }: PointsPanelProps) {
  const [swapAmount, setSwapAmount] = useState<number>(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const rate = systemConfig?.pointsToUsdtRate || 10000;
  const estimatedUSDT = swapAmount / rate;
  const canSwap = swapAmount >= 1000 && (user?.points || 0) >= swapAmount;

  const handleSwap = async () => {
    if (!onSwap || !canSwap) return;
    setIsSwapping(true);
    try {
      await onSwap(swapAmount);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e) {
      setStatus('error');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={close} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative liquid-glass w-full max-w-[480px] p-8 sm:p-12 rounded-[48px] border-white/5 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <TrendingUp size={160} strokeWidth={1} />
        </div>

        <button onClick={close} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 opacity-40 transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-3xl bg-violet/20 flex items-center justify-center text-violet">
            <Coins size={24} />
          </div>
          <h2 className="font-display text-3xl font-black italic uppercase tracking-tighter">Economy Terminal</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 text-center">
              <div className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Velvet Points</div>
              <div className="text-3xl font-black italic text-violet tracking-tighter">{user?.points.toLocaleString() || 0}</div>
           </div>
           <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 text-center">
              <div className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">USDT Balance</div>
              <div className="text-3xl font-black italic text-green-400 tracking-tighter">{(user?.usdtBalance || 0).toFixed(2)}</div>
           </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-white/30">Liquidate Assets</h4>
              <span className="text-[10px] font-black text-violet opacity-60">MIN: 1,000 PTS</span>
            </div>
            
            <div className="space-y-4">
              <div className="relative group">
                <input 
                  type="number"
                  placeholder="Cantidad de puntos..."
                  value={swapAmount || ''}
                  onChange={(e) => setSwapAmount(Number(e.target.value))}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 px-6 font-black italic text-xl outline-none focus:border-violet/40 transition-all placeholder:text-white/10"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <div className="px-3 py-1 rounded-full bg-violet/10 text-violet text-[10px] font-black uppercase tracking-widest">PTS</div>
                </div>
              </div>

              <div className="flex items-center justify-center py-4 opacity-20">
                <ArrowRightLeft size={24} />
              </div>

              <div className="relative">
                <div className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 font-black italic text-xl text-green-400 flex justify-between items-center">
                  <span>{estimatedUSDT.toFixed(4)}</span>
                  <span className="text-[10px] font-black text-green-400/40 uppercase tracking-widest">USDT ESTIMATED</span>
                </div>
              </div>

              <button 
                onClick={handleSwap}
                disabled={!canSwap || isSwapping}
                className={`w-full py-5 rounded-3xl font-black uppercase tracking-[4px] text-[11px] transition-all flex items-center justify-center gap-4 ${
                  canSwap 
                    ? 'bg-violet text-white shadow-2xl shadow-violet/20 hover:scale-[1.02]' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                {isSwapping ? <RefreshCcw className="animate-spin" /> : status === 'success' ? <CheckCircle2 /> : <Zap size={18} />}
                {status === 'success' ? 'EXCHANGE_SUCCESS' : isSwapping ? 'Processing...' : 'Authorize Exchange'}
              </button>

              <div className="flex items-center gap-3 justify-center text-[9px] font-black uppercase tracking-widest text-white/20 mt-4">
                 <AlertCircle size={12} />
                 Market Rate: 1 USDT = {rate.toLocaleString()} PTS
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RefreshCcw(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M21 21v-5h-5"/>
    </svg>
  );
}
