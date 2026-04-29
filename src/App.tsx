import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Star, 
  ChevronRight,
  ArrowUp,
  Cpu,
  Wallet,
  Coins,
  Shield
} from 'lucide-react';
import { useUser } from './hooks/useUser';
import { CATALOG, CATEGORIES } from './constants';
import { Video, TIER_COSTS } from './types';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { VideoCard } from './components/VideoCard';
import { PointsPanel } from './components/Modals/PointsPanel';
import { ProfilePanel } from './components/Modals/ProfilePanel';
import { UnlockModal } from './components/Modals/UnlockModal';
import { VideoModal } from './components/Modals/VideoModal';
import { UploadModal } from './components/Modals/UploadModal';
import { MiningHub } from './components/Modals/MiningHub';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { AdminPanel } from './components/Admin/AdminPanel';
import { OraclePanel } from './components/Admin/OraclePanel';

export default function App() {
  const { 
    user, 
    systemConfig,
    loading, 
    updateProfile, 
    addPoints, 
    purchaseCosmetic,
    purchaseNode,
    activateNode,
    overclockNode,
    collectEarnings,
    swapPointsForUSDT,
    createTrade,
    confirmTrade,
    cancelTrade,
    signInWithGoogle, 
    logout, 
    incrementViews 
  } = useUser();
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(!!sessionStorage.getItem('velvet_age_confirmed'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'none' | 'points' | 'profile' | 'upload' | 'mining'>('none');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [unlockVideo, setUnlockVideo] = useState<Video | null>(null);
  const [toasts, setToasts] = useState<{id: number, type: string, title: string, msg: string}[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [dbVideos, setDbVideos] = useState<Video[]>([]);

  // Hero logic
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const vids = snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
      setDbVideos(vids);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });
  }, []);

  const allVideos = [...CATALOG, ...dbVideos].reduce((acc: Video[], curr) => {
    if (!acc.find(v => v.id === curr.id)) acc.push(curr);
    return acc;
  }, []);

  const featuredVideos = allVideos.filter(v => v.featured);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (featuredVideos.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % featuredVideos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredVideos.length]);

  const addToast = (type: string, title: string, msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const handleAgeConfirm = () => {
    sessionStorage.setItem('velvet_age_confirmed', 'true');
    setIsAgeConfirmed(true);
  };

  const filteredVideos = allVideos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = activeCategory === 'Todos' || v.cat === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleVideoClick = (v: Video) => {
    const isUnlocked = v.tier === 'free' || (user && user.unlocked.includes(v.id));
    
    if (!isUnlocked) {
      if (!user) {
        addToast('warning', 'Contenido Premium', 'Inicia sesión con Google para desbloquear este video');
        signInWithGoogle();
        return;
      }
      setUnlockVideo(v);
    } else {
      incrementViews(v.id);
      setSelectedVideo(v);
    }
  };

  const handleUnlock = async () => {
    if (!user || !unlockVideo) return;
    const cost = TIER_COSTS[unlockVideo.tier];
    if (user.points < cost) return;

    await updateProfile({
      points: user.points - cost,
      unlocked: [...user.unlocked, unlockVideo.id]
    });

    addToast('unlock', 'Video Desbloqueado', 'Se han descontado los puntos');
    setSelectedVideo(unlockVideo);
    setUnlockVideo(null);
  };

  const handleUpload = async (videoData: any) => {
    if (!user) return;
    await addDoc(collection(db, 'videos'), {
      ...videoData,
      uploaderId: user.uid,
      createdAt: serverTimestamp()
    });
    addToast('success', 'Video Publicado', 'Tu video ya está disponible en el catálogo');
  };

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/panel" element={
        loading ? (
          <LoadingScreen />
        ) : user?.isAdmin ? (
          <AdminPanel />
        ) : user ? (
          <div className="min-h-screen bg-[#07050f] flex items-center justify-center p-6 text-center">
            <div className="liquid-glass p-12 rounded-[40px] max-w-md border-primary/20">
              <div className="text-primary mb-6 flex justify-center">
                <Shield size={64} strokeWidth={1} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-white">Acceso Restringido</h2>
              <p className="text-sm opacity-60 mb-8 text-white">Esta zona está reservada para el alto mando de Velvet. Tu identidad no coincide con los protocolos de nivel superior.</p>
              <button 
                onClick={() => window.location.href = '#/'}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px] text-white hover:bg-white/10 transition-all"
              >
                Volver al Portal
              </button>
            </div>
          </div>
        ) : (
          <Navigate to="/" replace />
        )
      } />
      <Route path="/oraculo" element={
        loading ? (
          <LoadingScreen />
        ) : user?.isAdmin ? (
          <OraclePanel />
        ) : (
          <Navigate to="/" replace />
        )
      } />
      <Route path="/" element={<MainSite 
        user={user}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        selectedVideo={selectedVideo}
        setSelectedVideo={setSelectedVideo}
        unlockVideo={unlockVideo}
        setUnlockVideo={setUnlockVideo}
        toasts={toasts}
        allVideos={allVideos}
        featuredVideos={featuredVideos}
        heroIndex={heroIndex}
        filteredVideos={filteredVideos}
        handleVideoClick={handleVideoClick}
        handleUpload={handleUpload}
        handleUnlock={handleUnlock}
        addPoints={addPoints}
        updateProfile={updateProfile}
        purchaseCosmetic={purchaseCosmetic}
        purchaseNode={purchaseNode}
        activateNode={activateNode}
        overclockNode={overclockNode}
        collectEarnings={collectEarnings}
        swapPointsForUSDT={swapPointsForUSDT}
        systemConfig={systemConfig}
        createTrade={createTrade}
        confirmTrade={confirmTrade}
        cancelTrade={cancelTrade}
        signInWithGoogle={signInWithGoogle}
        logout={logout}
        showScrollTop={showScrollTop}
        addToast={addToast}
        isAgeConfirmed={isAgeConfirmed}
        handleAgeConfirm={handleAgeConfirm}
      />} />
    </Routes>
  );
}

interface MainSiteProps {
  user: any;
  activePanel: any;
  setActivePanel: any;
  isDrawerOpen: boolean;
  setIsDrawerOpen: any;
  searchQuery: string;
  setSearchQuery: any;
  activeCategory: string;
  setActiveCategory: any;
  selectedVideo: any;
  setSelectedVideo: any;
  unlockVideo: any;
  setUnlockVideo: any;
  toasts: any[];
  allVideos: any[];
  featuredVideos: any[];
  heroIndex: number;
  filteredVideos: any[];
  handleVideoClick: (v: any) => void;
  handleUpload: (v: any) => Promise<void>;
  handleUnlock: () => Promise<void>;
  addPoints: any;
  updateProfile: any;
  purchaseCosmetic: any;
  purchaseNode: any;
  activateNode: any;
  overclockNode: any;
  collectEarnings: any;
  swapPointsForUSDT: (pts: number) => Promise<void>;
  systemConfig: any;
  createTrade: any;
  confirmTrade: any;
  cancelTrade: any;
  signInWithGoogle: any;
  logout: any;
  showScrollTop: boolean;
  addToast: any;
  isAgeConfirmed: boolean;
  handleAgeConfirm: () => void;
}

function MainSite({ 
  user, 
  activePanel, 
  setActivePanel, 
  isDrawerOpen, 
  setIsDrawerOpen, 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory, 
  selectedVideo, 
  setSelectedVideo, 
  unlockVideo, 
  setUnlockVideo, 
  toasts, 
  allVideos, 
  featuredVideos, 
  heroIndex, 
  filteredVideos, 
  handleVideoClick, 
  handleUpload, 
  handleUnlock,
  addPoints,
  updateProfile,
  purchaseCosmetic,
  purchaseNode,
  activateNode,
  overclockNode,
  collectEarnings,
  swapPointsForUSDT,
  systemConfig,
  createTrade,
  confirmTrade,
  cancelTrade,
  signInWithGoogle,
  logout,
  showScrollTop,
  addToast,
  isAgeConfirmed,
  handleAgeConfirm
}: MainSiteProps) {
  return (
    <div className="relative min-h-screen font-sans">
      <div className="bg-animation" />
      <div className="bg-noise" />

      <AnimatePresence>
        {!isAgeConfirmed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <div className="liquid-glass max-w-[450px] w-full p-12 rounded-[40px] text-center border-[#ffffff1a]">
              <div className="font-display text-6xl font-black text-gradient mb-4 italic leading-tight">18+</div>
              <h2 className="font-display text-3xl mb-4 uppercase tracking-tighter text-white">Verificación Obligatoria</h2>
              <p className="opacity-60 mb-8 leading-relaxed text-white">Este sitio contiene material explícito para adultos. Al entrar, confirmas que tienes al menos 18 años de edad y el deseo de ver dicho contenido.</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleAgeConfirm}
                  className="bg-primary py-4 rounded-2xl text-lg font-bold text-white shadow-[0_0_20px_rgba(255,45,109,0.3)] hover:scale-[1.02] transition-transform"
                >
                  Soy mayor de 18 años
                </button>
                <button 
                  onClick={() => window.location.href = 'https://google.com'}
                  className="py-4 rounded-2xl text-sm font-medium text-[#ffffff33] hover:text-[#ffffff99] transition-colors"
                >
                  Abandonar el sitio
                </button>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-[10px] opacity-30 uppercase tracking-widest leading-loose text-white">Cumplimiento Estricto 18 U.S.C. 2257</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        user={user} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} 
        toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        openPanel={setActivePanel}
        onLogin={signInWithGoogle}
      />

      <main className="pt-0">
        <Hero 
          video={featuredVideos[heroIndex] || CATALOG[0]} 
          onPlay={() => handleVideoClick(featuredVideos[heroIndex] || CATALOG[0])}
          openPoints={() => setActivePanel('points')}
        />

        <div className="px-6 relative -mt-4 z-10">
          <div className="md:hidden liquid-glass mb-6 px-4 py-2.5 rounded-full flex items-center gap-3">
            <Search size={18} className="opacity-40" />
            <input 
              type="text" 
              placeholder="Buscar..."
              className="bg-transparent outline-none flex-1 text-sm text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'bg-violet border-violet text-white' : 'liquid-glass border-transparent text-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 py-8">
            {filteredVideos.map(v => (
              <VideoCard 
                key={v.id} 
                video={v} 
                isUnlocked={user?.unlocked.includes(v.id) || v.tier === 'free'}
                onClick={() => handleVideoClick(v)}
              />
            ))}
          </div>
          
          {filteredVideos.length === 0 && (
             <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                <Search size={48} strokeWidth={1} />
                <p className="font-bold tracking-widest text-sm uppercase">Sin resultados para "{searchQuery}"</p>
             </div>
          )}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-[2999] bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-[300px] z-[3000] bg-[#07050fef] backdrop-blur-2xl p-8 pt-24 border-l border-white/10"
            >
              <div className="flex flex-col gap-6">
                <button 
                  onClick={() => { setActivePanel('upload'); setIsDrawerOpen(false); }}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-primary text-white font-bold"
                >
                  <Star size={18} fill="white" />
                  <span>Subir Video</span>
                </button>

                <button 
                  onClick={() => { setActivePanel('profile'); setIsDrawerOpen(false); }}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-violet/20 text-violet font-bold border border-violet/30"
                >
                  <Wallet size={18} />
                  <span>Marketplace & Trade</span>
                </button>

                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setIsDrawerOpen(false); }}
                    className="flex items-center justify-between px-6 py-3 rounded-xl hover:bg-white/5 transition-colors text-white"
                  >
                    <span className={activeCategory === cat ? 'text-violet font-semibold' : 'opacity-60 font-medium'}>{cat}</span>
                    <ChevronRight size={16} className="opacity-20" />
                  </button>
                ))}
                
                <div className="mt-12 p-6 liquid-glass rounded-[32px] text-center space-y-6 border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Coins size={16} />
                      <div className="text-2xl font-black font-mono italic">{(user?.usdtBalance || 0).toFixed(2)}</div>
                    </div>
                    <div className="text-[10px] opacity-40 uppercase tracking-[3px] font-black text-white">USDT Balance</div>
                  </div>
                  <div className="h-px bg-white/5 mx-4" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-violet">
                      <Star size={16} fill="currentColor" className="text-gold" />
                      <div className="text-2xl font-black italic">{user?.points.toLocaleString() || 0}</div>
                    </div>
                    <div className="text-[10px] opacity-40 uppercase tracking-[3px] font-black text-white">Velvet Points</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activePanel === 'points' && (
          <PointsPanel 
            close={() => setActivePanel('none')} 
            user={user} 
            onSwap={swapPointsForUSDT} 
            systemConfig={systemConfig} 
          />
        )}
        {activePanel === 'profile' && (
          <ProfilePanel 
            close={() => setActivePanel('none')} 
            user={user} 
            onLogout={() => { logout(); setActivePanel('none'); }} 
            onUpdate={updateProfile}
            onPurchase={purchaseCosmetic}
            onCreateTrade={createTrade}
            onConfirmTrade={confirmTrade}
            onCancelTrade={cancelTrade}
            onOpenMining={() => setActivePanel('mining')}
          />
        )}
        {activePanel === 'upload' && (
          <UploadModal onClose={() => setActivePanel('none')} onUpload={handleUpload} />
        )}
        {activePanel === 'mining' && user && (
          <MiningHub 
            user={user} 
            close={() => setActivePanel('none')} 
            onPurchase={purchaseNode}
            onActivate={activateNode}
            onOverclock={overclockNode}
            onCollect={collectEarnings}
            systemConfig={systemConfig}
          />
        )}
        {unlockVideo && (
          <UnlockModal 
            video={unlockVideo} 
            userPoints={user?.points || 0}
            onClose={() => setUnlockVideo(null)}
            onConfirm={handleUnlock}
          />
        )}
        {selectedVideo && (
          <VideoModal 
            video={selectedVideo} 
            user={user}
            onClose={() => setSelectedVideo(null)}
            onPointsEarned={addPoints}
            addToast={addToast}
            updateProfile={updateProfile}
            onLogin={signInWithGoogle}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-[5000] flex flex-col gap-3 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.8 }}
              className="pointer-events-auto liquid-glass p-4 rounded-2xl flex items-center gap-4 min-w-[280px] shadow-2xl text-white"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                t.type === 'pts' ? 'bg-violet' : t.type === 'unlock' ? 'bg-gold' : t.type === 'err' ? 'bg-red-500' : 'bg-green-500'
              }`}>
                <Star size={18} fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight">{t.title}</div>
                <div className="text-xs opacity-60 font-medium">{t.msg}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-8 z-[4000] w-12 h-12 rounded-full liquid-glass flex items-center justify-center hover:bg-violet transition-colors text-white"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
