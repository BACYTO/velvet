import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, ShieldCheck, Search, Send, Clock, CheckCircle2, XCircle, ArrowRightLeft, History, Cpu, Coins } from 'lucide-react';
import { UserProfile, Trade, UserNode } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, getDocs, limit, or, orderBy } from 'firebase/firestore';

interface TradePanelProps {
  user: UserProfile;
  close: () => void;
  onCreateTrade: (targetId: string | null, offer: any, request: any) => Promise<string>;
  onConfirmTrade: (id: string) => Promise<void>;
  onCancelTrade: (id: string) => Promise<void>;
}

export function TradePanel({ user, close, onCreateTrade, onConfirmTrade, onCancelTrade }: TradePanelProps) {
  const [tab, setTab] = useState<'market' | 'active' | 'post'>('market');
  const [targetId, setTargetId] = useState('');
  
  // Multi-asset trade state
  const [offerPoints, setOfferPoints] = useState(0);
  const [offerUSDT, setOfferUSDT] = useState(0);
  const [offerNodes, setOfferNodes] = useState<string[]>([]);
  
  const [reqPoints, setReqPoints] = useState(0);
  const [reqUSDT, setReqUSDT] = useState(0);
  const [reqNodes, setReqNodes] = useState<string[]>([]);

  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [myNodes, setMyNodes] = useState<UserNode[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const qTrades = query(collection(db, 'trades'), orderBy('createdAt', 'desc'), limit(50));
    const unsubTrades = onSnapshot(qTrades, (snap) => {
      setTrades(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade)));
    });

    const qNodes = query(collection(db, 'userNodes'), where('userId', '==', user.uid));
    const unsubNodes = onSnapshot(qNodes, (snap) => {
      setMyNodes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserNode)));
    });

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsubTrades(); unsubNodes(); clearInterval(timer); };
  }, [user.uid]);

  const marketTrades = trades.filter(t => t.status === 'pending' && t.receiverId === 'PUBLIC' && t.senderId !== user.uid);
  const myTrades = trades.filter(t => t.senderId === user.uid || t.receiverId === user.uid);

  const handleSearch = async () => {
    if (targetId.length < 5) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('uid', '==', targetId.trim()), limit(1));
      const snap = await getDocs(q);
      setSearchResult(!snap.empty ? snap.docs[0].data() : null);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      await onCreateTrade(
        isPublic ? null : searchResult?.uid, 
        { points: offerPoints, usdt: offerUSDT, nodes: offerNodes },
        { points: reqPoints, usdt: reqUSDT, nodes: reqNodes }
      );
      setTab('active');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return 'Expirado';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleNodeInOffer = (id: string) => {
    setOfferNodes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-2xl"
    >
      <div className="absolute inset-0" onClick={close} />
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative liquid-glass w-full max-w-[480px] rounded-[40px] border-[#ffffff14] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto scrollbar-hide">
          <button onClick={close} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 opacity-40 text-white z-10"><X size={20} /></button>
          
          <div className="mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet to-primary flex items-center justify-center text-white shadow-lg">
              <ArrowRightLeft size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Velvet Mercado</h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Intercambio P2P Seguro</p>
            </div>
          </div>

          <div className="flex gap-1 mb-8 p-1 bg-black/20 rounded-2xl border border-white/5">
            {[
              { id: 'market', label: 'Mercado', icon: Search },
              { id: 'post', label: 'Anunciar', icon: Send },
              { id: 'active', label: 'Órdenes', icon: History },
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tab === t.id ? 'bg-violet text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
              >
                <t.icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'market' && (
              <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {marketTrades.length === 0 ? (
                  <div className="py-20 text-center opacity-20 uppercase tracking-[3px] text-[10px] font-black">No hay anuncios activos</div>
                ) : (
                  marketTrades.map(trade => (
                    <div key={trade.id} className="p-5 rounded-3xl bg-white/5 border border-white/10 group hover:border-violet/40 transition-all flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="text-[10px] font-black text-violet/60 uppercase tracking-widest leading-none">Oferta de {(trade as any).senderName}</div>
                        <div className="text-[10px] font-black text-gold flex items-center gap-1 leading-none"><Clock size={12} /> {getTimeLeft(trade.expiresAt)}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                           <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Ofrece</div>
                           <div className="flex flex-wrap gap-2 text-white font-black text-sm uppercase italic">
                              {trade.senderPoints > 0 && <span className="flex items-center gap-1 text-primary">{trade.senderPoints} <span className="text-[8px] not-italic opacity-40">PTS</span></span>}
                              {trade.senderUSDT > 0 && <span className="flex items-center gap-1 text-green-400">{trade.senderUSDT.toFixed(2)} <span className="text-[8px] not-italic opacity-40">USDT</span></span>}
                              {trade.senderNodes && trade.senderNodes.length > 0 && <span className="flex items-center gap-1 text-violet">{trade.senderNodes.length} <Cpu size={12} /></span>}
                           </div>
                        </div>
                        <ArrowRightLeft className="text-white/10" size={16} />
                        <div className="flex-1 space-y-2 text-right">
                           <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Solicita</div>
                           <div className="flex flex-wrap justify-end gap-2 text-white font-black text-sm uppercase italic">
                              {trade.receiverPoints > 0 && <span className="flex items-center gap-1 text-primary">{trade.receiverPoints} <span className="text-[8px] not-italic opacity-40">PTS</span></span>}
                              {trade.receiverUSDT > 0 && <span className="flex items-center gap-1 text-green-400">{trade.receiverUSDT.toFixed(2)} <span className="text-[8px] not-italic opacity-40">USDT</span></span>}
                              {trade.receiverNodes && trade.receiverNodes.length > 0 && <span className="flex items-center gap-1 text-violet">CORES</span>}
                              {!trade.receiverPoints && !trade.receiverUSDT && (!trade.receiverNodes || trade.receiverNodes.length === 0) && <span className="text-white/20 text-[10px]">Gratis</span>}
                           </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (window.confirm(`¿Confirmas este intercambio?`)) {
                            setLoading(true);
                            onConfirmTrade(trade.id).finally(() => setLoading(false));
                          }
                        }}
                        className="w-full py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-violet hover:text-white transition-all shadow-xl"
                      >
                        Intercambiar
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {tab === 'post' && (
              <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <button onClick={() => setIsPublic(true)} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${isPublic ? 'bg-primary text-white shadow-lg' : 'text-white/20'}`}>A Todo el Público</button>
                  <button onClick={() => setIsPublic(false)} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${!isPublic ? 'bg-primary text-white shadow-lg' : 'text-white/20'}`}>ID Específico</button>
                </div>

                {!isPublic && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[2px] ml-4">ID de Usuario</label>
                    <div className="relative">
                      <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-violet text-white text-sm" value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="0x..." />
                      <button onClick={handleSearch} className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-violet/20 text-violet font-black text-[10px] uppercase">Buscar</button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-[9px] font-black text-violet uppercase tracking-widest mb-2 border-l-2 border-violet pl-3">Tú Entregas (Offer)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[8px] font-bold text-white/20 uppercase ml-2">Puntos</div>
                      <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white font-black outline-none focus:border-primary transition-all" value={offerPoints || ''} onChange={e => setOfferPoints(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] font-bold text-white/20 uppercase ml-2">USDT</div>
                      <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white font-black outline-none focus:border-green-400 transition-all font-mono" value={offerUSDT || ''} onChange={e => setOfferUSDT(Number(e.target.value))} />
                    </div>
                  </div>
                  
                  {myNodes.length > 0 && (
                    <div className="space-y-2">
                       <div className="text-[8px] font-bold text-white/20 uppercase ml-2">Mis Velvet Cores</div>
                       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {myNodes.map(node => (
                            <button 
                              key={node.id} 
                              onClick={() => toggleNodeInOffer(node.id)}
                              className={`flex-none w-14 h-14 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                                offerNodes.includes(node.id) ? 'bg-violet border-violet text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40'
                              }`}
                            >
                               <Cpu size={16} />
                               <span className="text-[7px] font-black uppercase tracking-tight">{node.name.split(' ')[2]}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 border-l-2 border-primary pl-3">Tú Recibes (Request)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[8px] font-bold text-white/20 uppercase ml-2">Puntos</div>
                      <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white font-black outline-none focus:border-primary transition-all" value={reqPoints || ''} onChange={e => setReqPoints(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] font-bold text-white/20 uppercase ml-2">USDT</div>
                      <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-white font-black outline-none focus:border-green-400 transition-all font-mono" value={reqUSDT || ''} onChange={e => setReqUSDT(Number(e.target.value))} />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={loading || (!isPublic && !searchResult) || (offerPoints <= 0 && offerUSDT <= 0 && offerNodes.length === 0)}
                  onClick={handlePost}
                  className="w-full py-5 rounded-[24px] bg-violet text-white font-black uppercase tracking-[3px] text-xs shadow-2xl shadow-violet/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20"
                >
                  Confirmar Anuncio
                </button>
              </motion.div>
            )}

            {tab === 'active' && (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {myTrades.length === 0 ? (
                  <div className="py-20 text-center opacity-20 uppercase tracking-[3px] text-[10px] font-black">Sin actividad reciente</div>
                ) : (
                  myTrades.map(trade => (
                    <div key={trade.id} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">ORDEN: {trade.id.substring(0,8)}</div>
                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          trade.status === 'completed' ? 'bg-primary text-white' : 
                          trade.status === 'cancelled' ? 'bg-white/10 text-white/40' : 'bg-gold text-black'
                        }`}>
                          {trade.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 py-2 border-y border-white/5">
                         <div className="flex-1 text-center">
                            <div className="text-[7px] text-white/20 uppercase font-black mb-1">Entregando</div>
                            <div className="text-[10px] text-white font-black uppercase">
                               {trade.senderId === user.uid ? 
                                 `${trade.senderPoints} PTS / ${trade.senderUSDT} USDT` : 
                                 `${trade.receiverPoints} PTS / ${trade.receiverUSDT} USDT`}
                            </div>
                         </div>
                         <ArrowRightLeft className="text-white/10" size={14} />
                         <div className="flex-1 text-center">
                            <div className="text-[7px] text-white/20 uppercase font-black mb-1">Recibiendo</div>
                            <div className="text-[10px] text-white font-black uppercase">
                               {trade.senderId === user.uid ? 
                                 `${trade.receiverPoints} PTS / ${trade.receiverUSDT} USDT` : 
                                 `${trade.senderPoints} PTS / ${trade.senderUSDT} USDT`}
                            </div>
                         </div>
                      </div>
                      
                      {trade.status === 'pending' && trade.senderId === user.uid && (
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-[9px] font-black text-gold/60 uppercase tracking-widest">{getTimeLeft(trade.expiresAt)}</div>
                          <button 
                            onClick={() => onCancelTrade(trade.id)}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Revocar
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-auto bg-black/40 p-4 text-center border-t border-white/5">
          <p className="text-[9px] leading-relaxed text-white/20 font-medium px-4">
            Sistema de seguridad Velvet P2P activado. Los fondos están protegidos durante el proceso de intercambio.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
