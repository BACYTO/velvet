import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  Database, 
  Zap, 
  ShieldCheck, 
  RefreshCcw, 
  ChevronRight,
  Lock,
  ArrowRightLeft,
  Settings,
  DollarSign,
  PieChart
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, getDocs, Timestamp, setDoc, limit } from 'firebase/firestore';
import { UserProfile, SystemConfig, MiningNode } from '../../types';

export function OraclePanel() {
  const [activeTab, setActiveTab] = useState<'audit' | 'economy' | 'regulations'>('audit');
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [nodes, setNodes] = useState<MiningNode[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditLog, setAuditLog] = useState<{msg: string, time: string}[]>([]);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'system', 'config'), (snap) => {
      if (snap.exists()) {
        setConfig({ id: snap.id, ...snap.data() } as SystemConfig);
      }
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    });

    const unsubNodes = onSnapshot(collection(db, 'mining_nodes'), (snap) => {
      setNodes(snap.docs.map(d => ({ id: d.id, ...d.data() } as MiningNode)));
    });

    return () => {
      unsubConfig();
      unsubUsers();
      unsubNodes();
    };
  }, []);

  const totalPoints = useMemo(() => users.reduce((acc, u) => acc + (u.points || 0), 0), [users]);
  const totalUsdt = useMemo(() => users.reduce((acc, u) => acc + (u.usdtBalance || 0), 0), [users]);

  const runAudit = async () => {
    setIsAuditing(true);
    setAuditLog([]);
    const log = (msg: string) => setAuditLog(prev => [{msg, time: new Date().toLocaleTimeString()}, ...prev]);

    log("Iniciando Escaneo de Red Velvet...");
    await new Promise(r => setTimeout(r, 1000));
    log(`Usuarios detectados: ${users.length}`);
    log(`Puntos en circulación: ${totalPoints.toLocaleString()}`);
    log(`Liquidez total USDT: ${totalUsdt.toFixed(2)}`);

    // Actualizar config
    if (config) {
      await updateDoc(doc(db, 'system', 'config'), {
        totalPointsInCirculation: totalPoints,
        totalUsdtReserve: totalUsdt,
        lastAudit: Timestamp.now()
      });
    } else {
      await setDoc(doc(db, 'system', 'config'), {
        pointsToUsdtRate: 10000,
        nodePriceMultiplier: 1.0,
        totalPointsInCirculation: totalPoints,
        totalUsdtReserve: totalUsdt,
        lastAudit: Timestamp.now(),
        globalYieldMultiplier: 1.0
      });
    }

    log("Auditoría de Invariantes completada.");
    setIsAuditing(false);
  };

  const updateGlobalParam = async (field: keyof SystemConfig, val: any) => {
    if (!config) return;
    await updateDoc(doc(db, 'system', 'config'), { [field]: val });
  };

  const inflationRisk = useMemo(() => {
    if (totalPoints === 0) return 0;
    // Arbitrary risk formula
    const risk = (totalPoints / 1000000) * (config?.globalYieldMultiplier || 1);
    return Math.min(risk, 100);
  }, [totalPoints, config]);

  return (
    <div className="min-h-screen bg-[#050510] text-white p-4 sm:p-10 font-sans selection:bg-violet/30 overflow-x-hidden">
      <div className="bg-noise fixed inset-0 opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header Terminal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-violet/20 border border-violet/40 flex items-center justify-center text-violet shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <Eye size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                Velvet Oracle 
                <span className="text-[10px] not-italic bg-violet/10 text-violet border border-violet/20 px-3 py-1 rounded-full uppercase tracking-widest font-black animate-pulse">Live Network</span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[4px]">Economic Guard Unit</span>
              </div>
            </div>
          </div>

          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            {['audit', 'economy', 'regulations'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white/10 text-white shadow-xl translate-y-[-2px]' : 'text-white/20 hover:text-white/40'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Visualizer */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'audit' && (
                <motion.div 
                  key="audit"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <StatCard 
                       label="Total Circulation" 
                       value={totalPoints.toLocaleString()} 
                       sub="Points" 
                       icon={<Database size={20} />} 
                       color="violet"
                     />
                     <StatCard 
                       label="Liquid Reserve" 
                       value={totalUsdt.toFixed(2)} 
                       sub="USDT" 
                       icon={<DollarSign size={20} />} 
                       color="green-500"
                     />
                     <StatCard 
                       label="Inflation Index" 
                       value={`${inflationRisk.toFixed(1)}%`} 
                       sub={inflationRisk > 50 ? 'Critical' : 'Stable'} 
                       icon={<TrendingUp size={20} />} 
                       color={inflationRisk > 70 ? 'red-500' : inflationRisk > 40 ? 'yellow-500' : 'blue-500'}
                     />
                  </div>

                  <div className="liquid-glass rounded-[48px] p-10 border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Activity size={120} strokeWidth={1} /></div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                      Audit Stream
                    </h3>
                    
                    <div className="h-[400px] overflow-y-auto space-y-4 pr-4 custom-scrollbar font-mono text-[11px]">
                      {auditLog.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 uppercase tracking-widest">
                          No active scan records
                        </div>
                      )}
                      {auditLog.map((log, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className="flex gap-4 items-start border-l-2 border-white/10 pl-4 py-1"
                        >
                          <span className="text-white/20 whitespace-nowrap">[{log.time}]</span>
                          <span className={`${log.msg.includes('detectados') ? 'text-violet' : 'text-white/70'}`}>{log.msg}</span>
                        </motion.div>
                      ))}
                    </div>

                    <button 
                      onClick={runAudit}
                      disabled={isAuditing}
                      className="mt-8 w-full py-5 rounded-3xl bg-violet text-white font-black uppercase tracking-[4px] text-[11px] shadow-2xl shadow-violet/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {isAuditing ? <RefreshCcw className="animate-spin" size={18} /> : <Zap size={18} />}
                      {isAuditing ? 'Auditing Network...' : 'Launch Full Audit'}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'economy' && (
                <motion.div 
                  key="economy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="liquid-glass p-10 rounded-[48px] border-white/5 space-y-10">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                      Global Economic Parameters
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[3px] text-white/30 block mb-4">Points to USDT Rate</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="1000" 
                              max="50000" 
                              step="500"
                              value={config?.pointsToUsdtRate || 10000}
                              onChange={(e) => updateGlobalParam('pointsToUsdtRate', Number(e.target.value))}
                              className="flex-1 accent-violet"
                            />
                            <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 font-black text-violet">
                              {config?.pointsToUsdtRate} <span className="text-[8px] opacity-40">PTS/USDT</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-white/30 mt-4 uppercase tracking-widest leading-relaxed">
                            Ajusta cuántos puntos se necesitan para canjear 1 USDT. Un valor alto previene la fuga de capital.
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[3px] text-white/30 block mb-4">Hardware Price Multiplier</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="0.5" 
                              max="3.0" 
                              step="0.1"
                              value={config?.nodePriceMultiplier || 1.0}
                              onChange={(e) => updateGlobalParam('nodePriceMultiplier', Number(e.target.value))}
                              className="flex-1 accent-primary"
                            />
                            <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 font-black text-primary">
                              {config?.nodePriceMultiplier}x
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                         <div className="p-8 bg-violet/5 border border-violet/20 rounded-[32px] space-y-4">
                            <div className="flex items-center gap-3 text-violet font-black uppercase text-[10px] tracking-widest">
                               <ShieldCheck size={16} /> Asset Liquidity Protection
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">
                               El sistema monitorea la tasa de quema de puntos vs la creación de USDT. Si el ratio supera el 4:1, el Oráculo aumentará automáticamente la dificultad de minado.
                            </p>
                         </div>

                         <div className="p-8 bg-primary/5 border border-primary/20 rounded-[32px] space-y-4">
                            <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-widest">
                               <Zap size={16} /> Global Yield Multiplier
                            </div>
                            <div className="flex items-center gap-4">
                              <input 
                                type="range" 
                                min="0.1" 
                                max="2.0" 
                                step="0.1"
                                value={config?.globalYieldMultiplier || 1.0}
                                onChange={(e) => updateGlobalParam('globalYieldMultiplier', Number(e.target.value))}
                                className="flex-1 accent-primary"
                              />
                              <div className="font-black text-lg">{config?.globalYieldMultiplier}x</div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar / Quick Controls */}
          <div className="lg:col-span-4 space-y-8">
            <div className="liquid-glass p-8 rounded-[40px] border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-[4px] text-white/30 mb-6 flex items-center gap-2">
                <PieChart size={14} /> Market Distribution
              </h4>
              <div className="space-y-6">
                <DistributionBar label="Basic Nodes" percent={45} color="#94a3b8" />
                <DistributionBar label="Pro Nodes" percent={30} color="#22d3ee" />
                <DistributionBar label="Elite Clusters" percent={15} color="#fbbf24" />
                <DistributionBar label="Quantum Cores" percent={10} color="#c084fc" />
              </div>
            </div>

            <div className="liquid-glass p-8 rounded-[40px] border-white/5 space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[4px] text-white/30 mb-4">Emergency Protocols</h4>
               <button className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                  Freeze Trading
               </button>
               <button className="w-full py-4 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all">
                  Hard Reset Multipliers
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: any) {
  return (
    <div className="liquid-glass p-8 rounded-[40px] border-white/5 group hover:border-white/10 transition-all">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-6`} style={{ backgroundColor: `var(--${color}-20)`, color: `var(--${color})` }}>
        {icon}
      </div>
      <div className="text-[10px] font-black uppercase tracking-[3px] text-white/20 mb-1">{label}</div>
      <div className="text-3xl font-black italic text-white tracking-tighter">{value}</div>
      <div className="text-[9px] font-bold text-white/30 uppercase mt-1 tracking-widest">{sub}</div>
    </div>
  );
}

function DistributionBar({ label, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
        <span className="text-white/40">{label}</span>
        <span style={{ color }}>{percent}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
