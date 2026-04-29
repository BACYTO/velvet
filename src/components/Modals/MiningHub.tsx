import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Zap, Flame, Activity, ShoppingCart, LayoutGrid, Timer, TrendingUp, AlertTriangle, Box, RefreshCw, Coins, ArrowRightLeft } from 'lucide-react';
import { UserProfile, UserNode, MiningNode } from '../../types';
import { NODE_TEMPLATES, getFloatLabel, getFloatMultiplier } from '../../constants';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ProceduralNode } from '../Mining/ProceduralNode';

const ICON_MAP = {
  Cpu: <Cpu size={12} />,
  Zap: <Zap size={12} />,
  Box: <Box size={12} />,
  Activity: <Activity size={12} />,
  Flame: <Flame size={12} />
};

const MASTER_ICON_MAP = {
  Cpu: <Cpu size={28} />,
  Zap: <Zap size={28} />,
  Box: <Box size={28} />,
  Activity: <Activity size={28} />,
  Flame: <Flame size={28} />
};


interface MiningHubProps {
  user: UserProfile;
  close: () => void;
  onPurchase: (node: MiningNode) => Promise<void>;
  onActivate: (id: string) => Promise<void>;
  onOverclock: (id: string) => Promise<void>;
  onCollect: (id: string, amount: number) => Promise<void>;
  systemConfig?: any;
}

export function MiningHub({ user, close, onPurchase, onActivate, onOverclock, onCollect, systemConfig }: MiningHubProps) {
  const [tab, setTab] = useState<'farm' | 'shop'>('farm');
  const [userNodes, setUserNodes] = useState<UserNode[]>([]);
  const [dbTemplates, setDbTemplates] = useState<MiningNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Merge static templates with dynamic ones from DB
  const allTemplates = useMemo(() => {
    return [...NODE_TEMPLATES, ...dbTemplates];
  }, [dbTemplates]);

  useEffect(() => {
    const qNodes = query(collection(db, 'userNodes'), where('userId', '==', user.uid));
    const unsubNodes = onSnapshot(qNodes, (snap) => {
      setUserNodes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserNode)));
    });

    const unsubTemplates = onSnapshot(collection(db, 'mining_nodes'), (snap) => {
      const list: MiningNode[] = [];
      snap.forEach(doc => list.push(doc.data() as MiningNode));
      setDbTemplates(list);
    });

    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => { unsubNodes(); unsubTemplates(); clearInterval(ticker); };
  }, [user.uid]);

  const calculateEarnings = (node: UserNode) => {
    if (node.status !== 'online' || !node.lastActivation) return 0;
    const template = allTemplates.find(t => t.id === node.nodeId);
    if (!template) return 0;

    const start = node.lastActivation.toDate().getTime();
    const elapsedHrs = (now - start) / (1000 * 60 * 60);
    const cappedHrs = Math.min(elapsedHrs, template.activationInterval);
    
    const multiplier = getFloatMultiplier(node.floatValue);
    const overclockBonus = 1 + (node.overclockLevel * 0.2);
    const globalMultiplier = systemConfig?.globalYieldMultiplier || 1.0;
    
    return Math.floor(template.baseYield * cappedHrs * multiplier * overclockBonus * globalMultiplier);
  };

  const getProgress = (node: UserNode) => {
    if (node.status !== 'online' || !node.lastActivation) return 0;
    const template = allTemplates.find(t => t.id === node.nodeId);
    if (!template) return 0;
    const start = node.lastActivation.toDate().getTime();
    const elapsed = (now - start) / (1000 * 60 * 60);
    return Math.min((elapsed / template.activationInterval) * 100, 100);
  };

  const isExpired = (node: UserNode) => {
    if (node.status !== 'online' || !node.lastActivation) return false;
    const template = allTemplates.find(t => t.id === node.nodeId);
    if (!template) return false;
    const start = node.lastActivation.toDate().getTime();
    return (now - start) / (1000 * 60 * 60) >= template.activationInterval;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-3xl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
        <div className="grid-bg w-[200%] h-[200%] absolute -top-1/2 -left-1/2 rotate-12 opacity-10" />
      </div>

      <div className="absolute inset-0" onClick={close} />
      
      <motion.div 
        initial={{ scale: 0.9, y: 50, rotateX: 10 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        className="relative w-full max-w-[1000px] max-h-[90vh] bg-[#0a0a14] rounded-[48px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
      >
        {/* Top Navigation */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet/20 to-primary/20 flex items-center justify-center text-violet border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
              <Cpu size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Velvet Racks</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-[4px]">System Infrastructure</span>
              </div>
            </div>
          </div>

          <div className="flex bg-black/30 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setTab('farm')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[3px] transition-all ${tab === 'farm' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
            >
              Farm
            </button>
            <button 
              onClick={() => setTab('shop')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[3px] transition-all ${tab === 'shop' ? 'bg-white/10 text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
            >
              Factory
            </button>
          </div>

          <button onClick={close} className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] relative">
          <AnimatePresence mode="wait">
            {tab === 'farm' ? (
              <motion.div 
                key="farm" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {userNodes.length === 0 ? (
                  <div className="col-span-full py-40 text-center">
                    <div className="text-white/5 mb-8 flex justify-center"><LayoutGrid size={80} strokeWidth={1} /></div>
                    <div className="uppercase tracking-[8px] text-lg font-black text-white/20">No Active Units</div>
                    <button onClick={() => setTab('shop')} className="mt-10 px-10 py-4 bg-violet rounded-full text-[11px] font-black uppercase tracking-[4px] text-white hover:scale-105 transition-transform shadow-2xl shadow-violet/30">Go to Factory</button>
                  </div>
                ) : (
                  userNodes.map((node, i) => {
                    const template = allTemplates.find(t => t.id === node.nodeId);
                    const earnings = calculateEarnings(node);
                    const progress = getProgress(node);
                    const expired = isExpired(node);
                    const floatInfo = getFloatLabel(node.floatValue);
                    const isBurnt = node.status === 'burnt';

                    return (
                      <motion.div 
                        key={node.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`relative group rounded-[40px] overflow-hidden border transition-all duration-500 ${
                          isBurnt ? 'bg-red-500/5 border-red-500/20' :
                          node.status === 'online' ? 'bg-[#12121f] border-violet/30 shadow-[0_25px_50px_rgba(0,0,0,0.5)] scale-[1.02]' :
                          'bg-[#0f0f1a] border-white/5 opacity-80'
                        }`}
                        style={{ borderColor: node.status === 'online' ? `${template?.color}44` : undefined }}
                      >
                        {/* Machine Faceplate */}
                        <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span style={{ color: template?.color || '#fff' }} className={node.status === 'online' ? 'animate-pulse' : ''}>
                              {template ? ICON_MAP[template.icon as keyof typeof ICON_MAP] : <Cpu size={14} />}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[2px] text-white/70 italic">{node.name}</span>
                          </div>
                        </div>

                        {/* PIXEL ART DISPLAY */}
                        <div className="aspect-[3/2] bg-black/80 flex items-center justify-center p-10 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_70%)]" />
                           <div className="relative z-10 transition-transform duration-700 group-hover:scale-125">
                            <ProceduralNode 
                                data={template?.pixelArt} 
                                seed={template?.art}
                                color={template?.color || '#fff'} 
                                isActive={node.status === 'online'} 
                                size={8}
                              />
                           </div>
                           
                           {node.status === 'online' && (
                             <motion.div 
                               animate={{ opacity: [0.05, 0.2, 0.05] }}
                               transition={{ repeat: Infinity, duration: 0.2 }}
                               className="absolute inset-0 pointer-events-none bg-white/5"
                             />
                           )}

                           <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-20 group-hover:opacity-100 transition-opacity">
                              <div className="text-[8px] font-black font-mono tracking-tighter">HEX_SIG: {(node.customSeed || 'DEFAULT').slice(0, 8)}</div>
                              {node.status === 'online' && <Activity size={12} className="text-green-500 animate-pulse" />}
                           </div>
                        </div>

                        {/* Machine Body */}
                        <div className="p-8 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className={`text-[10px] font-black uppercase tracking-[3px] ${floatInfo.color}`}>
                                {floatInfo.label}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                                  FV: {node.floatValue.toFixed(4)}
                                </div>
                                <div className="text-[10px] font-black text-violet bg-violet/10 px-3 py-1 rounded-lg">
                                  {getFloatMultiplier(node.floatValue).toFixed(1)}x
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black text-white italic tracking-tighter leading-none">{earnings}</div>
                              <div className="text-[9px] font-black text-white/20 uppercase tracking-[2px] mt-1">Accumulated</div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Energy Bar */}
                            {node.status === 'online' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-30">
                                   <span>Cycle Progress</span>
                                   <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10 p-0.5">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={`h-full rounded-full ${expired ? 'bg-red-500' : 'bg-gradient-to-r from-violet to-primary shadow-[0_0_20px_rgba(255,45,109,0.5)]'}`}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Controls */}
                            <div className="flex gap-3 pt-2">
                              {isBurnt ? (
                                <div className="flex-1 py-4 text-center text-red-500 font-black uppercase tracking-[4px] text-[10px] bg-red-500/10 rounded-2xl border border-red-500/20 shadow-2xl shadow-red-500/20">
                                  CORE_FAILURE
                                </div>
                              ) : node.status === 'offline' ? (
                                <button 
                                  onClick={() => onActivate(node.id)}
                                  className="flex-1 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[4px] hover:brightness-125 transition-all shadow-xl shadow-primary/30 active:scale-95"
                                >
                                  INITIALIZE
                                </button>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => onCollect(node.id, earnings)}
                                    className={`flex-[2] py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[3px] hover:bg-violet hover:text-white transition-all shadow-xl ${expired ? 'animate-pulse ring-2 ring-primary animate-bounce' : ''}`}
                                  >
                                    CLAIM_YIELD
                                  </button>
                                  <button 
                                    disabled={node.overclockLevel >= 10}
                                    onClick={() => {
                                       if (confirm('DANGER: Overclocking increases performance but causes permanent Float degradation and potential Core meltdown. Proceed?')) {
                                          onOverclock(node.id);
                                       }
                                    }}
                                    className="flex-1 py-4 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white text-[11px] font-black transition-all flex items-center justify-center gap-2 group"
                                  >
                                    <Flame size={16} className={node.overclockLevel > 0 ? 'animate-pulse' : ''} /> {node.overclockLevel}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="shop" 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-8"
              >
                {allTemplates.map(node => (
                  <div key={node.id} className="group relative p-8 rounded-[48px] bg-[#12121f] border border-white/10 hover:border-violet/40 transition-all duration-500 overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-20 -top-20 w-60 h-60 blur-[100px] rounded-full group-hover:opacity-60 transition-all opacity-20 pointer-events-none" style={{ backgroundColor: node.color }} />
                    
                    <div>
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center transition-all shadow-2xl" style={{ color: node.color, borderColor: `${node.color}33` }}>
                          {MASTER_ICON_MAP[node.icon as keyof typeof MASTER_ICON_MAP]}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{node.name}</h3>
                          <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase w-fit tracking-[3px] border border-white/10 mt-1" style={{ borderColor: `${node.color}44`, color: node.color, backgroundColor: `${node.color}11` }}>{node.tier} CLASS</div>
                        </div>
                      </div>

                      <div className="aspect-video bg-black/60 rounded-[32px] flex items-center justify-center p-8 mb-8 border border-white/10 relative overflow-hidden group/art">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
                        <div className="transition-transform duration-700 group-hover/art:scale-110">
                          <ProceduralNode 
                            data={node.pixelArt} 
                            seed={node.art}
                            color={node.color} 
                            size={8}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-5 rounded-3xl bg-black/40 border border-white/5">
                          <div className="text-[8px] font-black text-white/30 uppercase tracking-[2px] mb-2">Efficiency</div>
                          <div className="text-xl font-black text-white">{node.baseYield} <span className="text-[10px] text-violet not-italic tracking-widest">PTS/H</span></div>
                        </div>
                        <div className="p-5 rounded-3xl bg-black/40 border border-white/5">
                          <div className="text-[8px] font-black text-white/30 uppercase tracking-[2px] mb-2">Max Session</div>
                          <div className="text-xl font-black text-white">{node.activationInterval} <span className="text-[10px] text-primary not-italic tracking-widest">HRS</span></div>
                        </div>
                      </div>

                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed mb-8 px-2">
                        {node.desc || "Advanced node architecture designed for high-density neural processing."}
                      </p>
                    </div>

                    <button 
                      onClick={() => onPurchase(node)}
                      disabled={user.points < Math.round(node.cost * (systemConfig?.nodePriceMultiplier || 1.0))}
                      className="w-full py-5 rounded-[24px] bg-violet text-white font-black uppercase tracking-[4px] text-[11px] shadow-[0_20px_40px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4"
                    >
                      PURCHASE: {Math.round(node.cost * (systemConfig?.nodePriceMultiplier || 1.0)).toLocaleString()} PTS <ArrowRightLeft size={16} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-10 bg-black/80 border-t border-white/5 flex items-center justify-between backdrop-blur-3xl">
           <div className="flex items-center gap-12">
              <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-[3px]">Capital Available</span>
                 <span className="text-2xl font-black text-white">{user.points.toLocaleString()} <span className="text-[12px] text-violet italic tracking-tighter">PTS</span></span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/10 pl-12">
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-[3px]">Liquidez USDT</span>
                 <span className="text-2xl font-black text-green-400 font-mono italic">{(user.usdtBalance || 0).toFixed(2)} <span className="text-[12px] text-white/40 not-italic">USDT</span></span>
              </div>
              <div className="hidden lg:flex flex-col gap-1 border-l border-white/10 pl-12">
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-[3px]">Active Core Cluster</span>
                 <span className="text-2xl font-black text-primary">{userNodes.filter(n => n.status === 'online').length} <span className="text-[12px] text-white/40">/ {userNodes.length} UNITS</span></span>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[4px] bg-white/5 px-6 py-3 rounded-full border border-white/5">
                 <TrendingUp size={16} className="text-green-500" /> Velvet Net: <span className="text-green-500">1.2 PHz</span>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
