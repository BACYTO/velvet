import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Lock, Palette } from 'lucide-react';
import { UserProfile, Cosmetic } from '../../types';
import { COSMETICS } from '../../constants/cosmetics';
import { AvatarVFX } from '../VFX/AvatarVFX';

interface CosmeticShopProps {
  user: UserProfile;
  close: () => void;
  onPurchase: (c: Cosmetic) => Promise<void>;
  onEquip: (type: string, id: string) => Promise<void>;
}

export function CosmeticShop({ user, close, onPurchase, onEquip }: CosmeticShopProps) {
  const [tab, setTab] = useState<'background' | 'frame' | 'effect'>('background');
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = COSMETICS.filter(c => c.type === tab);
  const owned = user.inventory || [];

  const handlePurchase = async (c: Cosmetic) => {
    try {
      setLoading(c.id);
      await onPurchase(c);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleEquip = async (c: Cosmetic) => {
    setLoading(c.id);
    await onEquip(c.type, c.id);
    setLoading(null);
  };

  const getVfxType = (id: string): 'fuego' | 'electric' | 'void' | 'none' => {
    if (id === 'effect-fire') return 'fuego';
    if (id === 'effect-electric') return 'electric';
    if (id === 'effect-void') return 'void';
    return 'none';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0" onClick={close} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative liquid-glass w-full max-w-[560px] p-6 sm:p-8 rounded-[40px] border-[#ffffff14] overflow-hidden shadow-2xl"
      >
        <button onClick={close} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 opacity-40 text-white z-10"><X size={20} /></button>
        
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Personalización</h3>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40">Equípate con estilo</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-violet font-bold text-sm sm:text-base">{user.points} PTS</div>
            <div className="text-[9px] uppercase tracking-widest text-white/20 font-bold">Saldo</div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 p-1 bg-black/20 rounded-2xl border border-white/5">
          {[
            { id: 'background', label: 'Fondos', icon: Palette },
            { id: 'frame', label: 'Marcos', icon: Check },
            { id: 'effect', label: 'Efectos', icon: Sparkles }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all ${
                tab === t.id ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:bg-white/5 hover:text-white/50'
              }`}
            >
              <t.icon size={12} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.substring(0,3)}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-[380px] overflow-y-auto pr-2 scrollbar-hide">
          <AnimatePresence mode="wait">
            {filtered.map(c => {
              const isOwned = owned.includes(c.id);
              const isEquipped = user.activeCosmetics?.[c.type as keyof typeof user.activeCosmetics] === c.id;
              const vfxType = getVfxType(c.id);

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={c.id}
                  className={`relative group rounded-[32px] overflow-hidden border transition-all ${
                    isEquipped ? 'border-primary ring-1 ring-primary/20' : 'border-white/5'
                  }`}
                >
                  <div className="h-24 w-full relative bg-black/40 overflow-hidden">
                    <img 
                      src={c.previewUrl} 
                      alt={c.name} 
                      className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Real-time VFX Preview */}
                    {c.type === 'effect' && vfxType !== 'none' && (
                      <div className="absolute inset-0 flex items-center justify-center scale-75">
                         <AvatarVFX type={vfxType} size={80} />
                      </div>
                    )}
                    
                    {/* Frame Preview */}
                    {c.type === 'frame' && (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-2 border-yellow-400 bg-white/5 shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
                       </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  
                  <div className="p-3 bg-black/40 backdrop-blur-md">
                    <h4 className="text-[10px] font-bold text-white mb-2 truncate">{c.name}</h4>
                    
                    {isOwned ? (
                      <button 
                        onClick={() => handleEquip(c)}
                        className={`w-full py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all ${
                          isEquipped ? 'bg-primary text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {isEquipped ? 'Equipado' : 'Equipar'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePurchase(c)}
                        disabled={loading === c.id || user.points < c.cost}
                        className="w-full py-2 rounded-xl bg-violet text-white text-[8px] font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        {c.cost} PTS
                      </button>
                    )}
                  </div>

                  {c.permissionRequired && !user.roles?.includes(c.permissionRequired) && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center z-20">
                      <Lock size={16} className="text-primary mb-2" />
                      <div className="text-[8px] font-bold text-white uppercase tracking-widest leading-tight">Req: {c.permissionRequired}</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
