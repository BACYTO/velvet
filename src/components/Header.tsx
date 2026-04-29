import React from 'react';
import { Search, Menu, Upload, Star, Coins } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toggleDrawer: () => void;
  openPanel: (p: 'none' | 'points' | 'profile' | 'upload' | 'mining') => void;
  onLogin: () => void;
}

export function Header({ user, searchQuery, setSearchQuery, toggleDrawer, openPanel, onLogin }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full h-[72px] px-4 md:px-8 flex items-center justify-between z-[1000] bg-[#07050f33] backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        <button onClick={toggleDrawer} className="md:hidden p-2 text-white/60 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <a href="#" className="font-display text-xl sm:text-2xl font-black text-gradient leading-tight tracking-tight uppercase italic flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet to-primary flex items-center justify-center text-white text-sm scale-75 sm:scale-100">V</div>
          <span className="hidden sm:inline">Velvet</span>
        </a>
      </div>

      <div className="hidden md:flex flex-1 max-w-[460px] mx-10 relative group">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-white group-focus-within:text-violet group-focus-within:opacity-100 transition-all" />
        <input 
          type="text" 
          placeholder="Explora videos, creadores y más..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 outline-none focus:border-violet/40 focus:bg-white/[0.08] transition-all text-sm text-white placeholder:text-white/20 font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4">
        {!user ? (
          <button 
            onClick={onLogin}
            className="bg-violet hover:bg-violet/90 active:scale-95 text-white px-4 sm:px-8 py-2.5 rounded-2xl text-[10px] sm:text-sm font-bold transition-all shadow-xl shadow-violet/20"
          >
            Conectar
          </button>
        ) : (
          <>
            <button 
              onClick={() => openPanel('upload')}
              className="hidden md:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-white hover:bg-white/[0.08] hover:border-white/20 transition-all group"
              title="Publicar Contenido"
            >
              <Upload size={18} className="group-hover:scale-110 transition-transform" />
            </button>

            <div 
              className="flex flex-col items-end px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 group cursor-pointer hover:border-green-500/40 transition-all shrink-0"
            >
              <div className="text-[6px] sm:text-[8px] font-black text-white/20 uppercase tracking-[1px] sm:tracking-[2px] mb-0.5 sm:mb-1 leading-none">USDT</div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Coins size={9} className="text-green-400 sm:size-[12px]" />
                <span className="font-mono text-[10px] sm:text-sm font-black text-green-400 italic leading-none">
                  {(user.usdtBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div 
              onClick={() => openPanel('points')}
              className="bg-white/5 border border-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl flex flex-col items-end cursor-pointer hover:bg-white/[0.08] hover:border-white/20 transition-all text-white shrink-0"
            >
              <div className="text-[6px] sm:text-[8px] font-black text-white/20 uppercase tracking-[1px] sm:tracking-[2px] mb-0.5 sm:mb-1 leading-none">Points</div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Star size={9} className="text-gold sm:size-[12px]" fill="currentColor" />
                <span className="font-bold text-[10px] sm:text-sm tracking-tight uppercase italic leading-none">{(user.points || 0).toLocaleString()}</span>
              </div>
            </div>

            <div 
              onClick={() => openPanel('profile')}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet to-primary flex items-center justify-center font-bold text-sm border border-white/10 cursor-pointer hover:scale-[1.05] active:scale-95 transition-all text-white relative shadow-lg"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
              ) : (
                user.uid.substring(0, 1).toUpperCase()
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
