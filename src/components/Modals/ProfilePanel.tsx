import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { X, Edit2, Check, LogOut, Camera, Star, Shield, Wallet, Sparkles, Copy, Cpu, ShieldCheck } from 'lucide-react';
import { UserProfile, XP_LEVELS, Cosmetic } from '../../types';
import { TradePanel } from './TradePanel';
import { CosmeticShop } from './CosmeticShop';
import { COSMETICS } from '../../constants/cosmetics';
import { AvatarVFX } from '../VFX/AvatarVFX';

interface ProfilePanelProps {
  user: UserProfile | null;
  close: () => void;
  onLogout: () => void;
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>;
  onPurchase: (c: Cosmetic) => Promise<void>;
  onCreateTrade: (targetId: string | null, offer: any, request: any) => Promise<string>;
  onConfirmTrade: (id: string) => Promise<void>;
  onCancelTrade: (id: string) => Promise<void>;
  onOpenMining: () => void;
}

export function ProfilePanel({ close, user, onLogout, onUpdate, onPurchase, onCreateTrade, onConfirmTrade, onCancelTrade, onOpenMining }: ProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subPanel, setSubPanel] = useState<'none' | 'trade' | 'shop'>('none');
  const [editData, setEditData] = useState({
    displayName: user?.displayName || `User_${user?.uid.substring(0, 5)}`,
    bio: user?.bio || '',
    photoURL: user?.photoURL || ''
  });

  const xp = user?.xp || 0;
  const level = XP_LEVELS.find(l => xp >= l.range[0] && xp <= l.range[1]) || XP_LEVELS[0];
  const nextLevel = XP_LEVELS[XP_LEVELS.indexOf(level) + 1];
  const progress = nextLevel ? ((xp - level.range[0]) / (nextLevel.range[0] - level.range[0])) * 100 : 100;

  const handleSave = async () => {
    setLoading(true);
    await onUpdate(editData);
    setLoading(false);
    setIsEditing(false);
  };

  const copyUid = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.uid);
    alert('ID copiado al portapapeles');
  };

  const handleEquip = async (type: string, id: string) => {
    if (!user) return;
    const current = user.activeCosmetics || {};
    await onUpdate({
      activeCosmetics: { ...current, [type]: id }
    });
  };

  if (!user) return null;

  const activeBg = COSMETICS.find(c => c.id === user.activeCosmetics?.background);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl"
    >
      <div className="absolute inset-0" onClick={close} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative liquid-glass w-full max-w-[480px] p-6 md:p-10 rounded-[40px] md:rounded-[50px] border-[#ffffff14] overflow-hidden"
      >
        {activeBg ? (
          <div className="absolute inset-0 opacity-20 transition-opacity duration-1000">
            <img 
              src={activeBg.previewUrl} 
              className="w-full h-full object-cover" 
              alt="Wallpaper" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet/20 blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 blur-[120px] rounded-full" />
          </>
        )}

        <button onClick={close} className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/10 opacity-40 text-white z-10">
          <X size={20} />
        </button>

        <div className="relative flex flex-col items-center mb-10">
          <div className="relative group">
            <div className={`w-28 h-28 rounded-full p-1 mb-6 shadow-2xl transition-all ${
              user.activeCosmetics?.frame ? 'bg-gradient-to-tr from-yellow-400 via-white to-yellow-600' : 'bg-gradient-to-tr from-violet via-primary to-violet'
            }`}>
              <div className="w-full h-full rounded-full bg-[#07050f] flex items-center justify-center text-4xl font-bold font-display text-white overflow-hidden relative">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  user.displayName?.substring(0, 1).toUpperCase() || user.uid.substring(0, 1).toUpperCase()
                )}
                
                {/* High-Fidelity Particle VFX */}
                {user.activeCosmetics?.effect === 'effect-fire' && <AvatarVFX type="fuego" />}
                {user.activeCosmetics?.effect === 'effect-electric' && <AvatarVFX type="electric" />}
                {user.activeCosmetics?.effect === 'effect-void' && <AvatarVFX type="void" />}
              </div>
            </div>
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 p-2 rounded-full">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className={`text-2xl font-bold tracking-tight text-white ${user.activeCosmetics?.effect === 'effect-neon' ? 'drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''}`}>
                  {user.displayName || `Usuario ${user.uid.substring(0, 5)}`}
                </h2>
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center" title="Perfil Verificado">
                  <Shield size={10} className="text-white" fill="white" />
                </div>
                <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-40">
                  <Edit2 size={14} />
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4 bg-white/5 py-1 px-3 rounded-full w-fit mx-auto border border-white/5 cursor-pointer group" onClick={copyUid}>
                <span className="text-[9px] font-mono opacity-40 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-white">ID: {user.uid.substring(0, 8)}...</span>
                <Copy size={10} className="text-white opacity-20 group-hover:opacity-40" />
              </div>

              <p className="text-sm opacity-50 max-w-[280px] mx-auto line-clamp-2 italic mb-4 text-white">
                {user.bio || 'Sin biografía añadida todavía...'}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-[340px] mx-auto mb-8">
                <button 
                  onClick={() => setSubPanel('trade')}
                  className="flex-1 min-w-[120px] py-3.5 liquid-glass rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 active:scale-95 transition-all"
                >
                  <Wallet size={14} className="text-violet" /> Trade
                </button>
                <button 
                  onClick={() => setSubPanel('shop')}
                  className="flex-1 min-w-[100px] py-3.5 liquid-glass rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 active:scale-95 transition-all"
                >
                  <Sparkles size={14} className="text-primary" /> Estilo
                </button>
                <button 
                  onClick={() => onOpenMining()}
                  className="flex-1 min-w-[100px] py-3.5 bg-violet/20 border border-violet/30 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-violet/40 active:scale-95 transition-all"
                >
                  <Cpu size={14} className="text-violet" /> Cores
                </button>
                {user.isAdmin && (
                  <Link 
                    to="/panel"
                    className="w-full py-3.5 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10 mt-2"
                  >
                    <ShieldCheck size={14} /> Admin Access
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 mb-2">
                <div className="text-center text-white">
                  <div className="font-bold text-lg">{user.unlocked.length}</div>
                  <div className="text-[10px] opacity-30 uppercase tracking-[2px]">Unlocks</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-center text-white">
                  <div className="font-bold text-lg">{user.commented.length}</div>
                  <div className="text-[10px] opacity-30 uppercase tracking-[2px]">Misiones</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-center text-white">
                  <div className="font-bold text-lg">{Math.floor(user.xp / 100) + 1}</div>
                  <div className="text-[10px] opacity-30 uppercase tracking-[2px]">Nivel</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4 max-w-[320px]">
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 outline-none focus:border-violet transition-all text-center text-lg font-bold text-white"
                placeholder="Nombre de Usuario"
                value={editData.displayName}
                onChange={e => setEditData({...editData, displayName: e.target.value})}
              />
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 outline-none focus:border-violet transition-all text-center text-sm min-h-[80px] resize-none text-white"
                placeholder="Escribe algo sobre ti..."
                value={editData.bio}
                onChange={e => setEditData({...editData, bio: e.target.value})}
              />
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 outline-none focus:border-violet transition-all text-center text-[10px] text-white"
                placeholder="URL de foto de perfil"
                value={editData.photoURL}
                onChange={e => setEditData({...editData, photoURL: e.target.value})}
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 font-bold text-xs uppercase tracking-widest text-white"
                >
                  Regresar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] py-3 rounded-2xl bg-violet text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading ? '...' : <><Check size={16} /> Guardar</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet/10 flex items-center justify-center text-violet">
              <Star size={20} fill="currentColor" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[2px]">Rank: {level.name}</span>
                <span className="text-[10px] font-bold text-violet">{user.points} PTS</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-violet to-primary"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full group py-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[3px] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Cerrar Sesión
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {subPanel === 'trade' && (
          <TradePanel 
            user={user} 
            close={() => setSubPanel('none')} 
            onCreateTrade={onCreateTrade}
            onConfirmTrade={onConfirmTrade}
            onCancelTrade={onCancelTrade}
          />
        )}
        {subPanel === 'shop' && (
          <CosmeticShop 
            user={user} 
            close={() => setSubPanel('none')} 
            onPurchase={onPurchase}
            onEquip={handleEquip}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
