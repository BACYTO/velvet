import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Video, 
  Settings, 
  ShieldCheck, 
  Cpu, 
  Wallet, 
  TrendingUp, 
  AlertCircle,
  Search,
  Activity,
  ArrowUpRight,
  Zap,
  Globe,
  Plus,
  Trash2,
  Terminal as TerminalIcon,
  Dice5,
  Save,
  Dna,
  RefreshCcw,
  Monitor,
  Flame,
  Box
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, setDoc, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { UserProfile, MiningNode, Video as VideoType } from '../../types';

import { ProceduralNode } from '../Mining/ProceduralNode';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'laboratory' | 'users'>('dashboard');
  const [nodes, setNodes] = useState<MiningNode[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Node Form
  const [newNode, setNewNode] = useState<Partial<MiningNode>>({
    name: 'VELVET-NODE-X',
    tier: 'basic',
    baseYield: 10,
    activationInterval: 1,
    cost: 50,
    color: '#8b5cf6',
    icon: 'Zap',
    desc: 'Proto-type mining unit.'
  });
  const [nodeSeed, setNodeSeed] = useState(Math.random().toString(36).substring(7));

  useEffect(() => {
    const unsubNodes = onSnapshot(collection(db, 'mining_nodes'), (snap) => {
      const list: MiningNode[] = [];
      snap.forEach(doc => list.push(doc.data() as MiningNode));
      setNodes(list);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserProfile[] = [];
      snap.forEach(doc => list.push(doc.data() as UserProfile));
      setUsers(list);
    });

    setLoading(false);
    return () => {
      unsubNodes();
      unsubUsers();
    };
  }, []);

  const createNode = async () => {
    const id = `node_${Date.now()}`;
    
    // Improved Deterministic Generation Logic
    const stringToSeed = (s: string) => {
      let hash = 0;
      for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash) + s.charCodeAt(i);
      return hash;
    };
    
    let currentSeed = stringToSeed(nodeSeed);
    const random = () => {
      currentSeed = (currentSeed * 16807) % 2147483647;
      return (currentSeed - 1) / 2147483646;
    };

    const flatArt: string[] = Array(144).fill(' ');
    
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 6; x++) {
        const isEdge = x === 0 || x === 11 || y === 0 || y === 11;
        const isInner = x >= 4 && x <= 7 && y >= 4 && y <= 7;
        let char = ' ';
        const r = random();
        if (isEdge) { if (r > 0.6) char = '#'; }
        else if (isInner) { char = r > 0.3 ? '.' : '#'; }
        else { if (r > 0.5) char = '#'; if (r > 0.85) char = '.'; }
        
        flatArt[y * 12 + x] = char;
        flatArt[y * 12 + (11 - x)] = char;
      }
    }

    try {
      await setDoc(doc(db, 'mining_nodes', id), {
        ...newNode,
        id,
        pixelArt: flatArt,
        art: nodeSeed
      });
      setNodeSeed(Math.random().toString(36).substring(7));
      alert('SYNTHESIS_COMPLETE: Blueprint deployed to mainnet.');
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNode = async (id: string) => {
    if (!confirm('Destroy blueprint? Instances in field will remain but orphan.')) return;
    await deleteDoc(doc(db, 'mining_nodes', id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#06040a] text-white font-sans selection:bg-violet/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
      
      {/* Dev Navigation */}
      <aside className="fixed top-0 left-0 bottom-0 w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5 z-50 p-8 hidden xl:block">
        <div className="flex items-center gap-4 mb-20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet to-primary flex items-center justify-center shadow-2xl shadow-violet/40">
            <TerminalIcon size={24} />
          </div>
          <div>
            <div className="font-black italic text-2xl tracking-tighter">VELVET</div>
            <div className="text-[8px] font-black opacity-30 uppercase tracking-[4px]">SysAdmin Kernel</div>
          </div>
        </div>

        <nav className="space-y-3">
          {[
            { id: 'dashboard', label: 'Monitor Central', icon: Activity },
            { id: 'laboratory', label: 'Laboratorio de Nodos', icon: Dna },
            { id: 'users', label: 'Censo de Usuarios', icon: Users },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-xs ${
                activeTab === item.id ? 'bg-violet shadow-xl shadow-violet/20' : 'opacity-40 hover:opacity-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-8 right-8 p-6 rounded-3xl bg-white/5 border border-white/5">
          <div className="text-[10px] font-black opacity-30 uppercase tracking-[2px] mb-4">Kernel Status</div>
          <div className="flex items-center gap-2 text-green-500 font-bold text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            STABLE_PROD_04
          </div>
        </div>
      </aside>

      <main className="xl:pl-72 p-10 min-h-screen">
        <header className="flex items-center justify-between mb-12">
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">
             {activeTab === 'dashboard' && 'Telemetría Operativa'}
             {activeTab === 'laboratory' && 'R&D Factory'}
             {activeTab === 'users' && 'Gestión de Ciudadanos'}
           </h2>
           <button onClick={() => window.location.href = '#/'} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[3px] hover:bg-white/10 transition-all">Salir al Portal</button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="liquid-glass p-8 rounded-[40px] border-white/5">
                     <div className="text-[10px] font-black opacity-30 uppercase tracking-[3px] mb-2">Deployed Blueprints</div>
                     <div className="text-4xl font-black italic tracking-tighter">{nodes.length}</div>
                  </div>
                  <div className="liquid-glass p-8 rounded-[40px] border-white/5">
                     <div className="text-[10px] font-black opacity-30 uppercase tracking-[3px] mb-2">Network Citizens</div>
                     <div className="text-4xl font-black italic tracking-tighter">{users.length}</div>
                  </div>
                  <div className="liquid-glass p-8 rounded-[40px] border-white/5">
                     <div className="text-[10px] font-black opacity-30 uppercase tracking-[3px] mb-2">Kernel Load</div>
                     <div className="text-4xl font-black italic tracking-tighter">LOW</div>
                  </div>
               </div>

               <div className="liquid-glass rounded-[48px] p-10 border-white/5 min-h-[400px]">
                  <h3 className="text-xl font-black italic uppercase mb-8 flex items-center gap-3">
                    <Monitor size={20} className="text-violet" /> Hardware Distribution
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                     {nodes.map(node => (
                       <div key={node.id} className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5 group hover:border-violet/30 transition-all">
                          <ProceduralNode seed={node.art || 'default'} color={node.color} size={6} />
                          <div className="text-center">
                             <div className="text-[10px] font-black uppercase tracking-tight truncate w-full">{node.name}</div>
                             <div className="text-[8px] opacity-30 font-bold uppercase">{node.tier}</div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'laboratory' && (
            <motion.div key="lab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Creation Panel */}
               <div className="liquid-glass p-10 rounded-[48px] border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter">Blueprint Creator</h3>
                     <div className="flex gap-2">
                        <button onClick={() => setNodeSeed(Math.random().toString(36).substring(7))} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-violet"><RefreshCcw size={18} /></button>
                        <button onClick={createNode} className="flex items-center gap-3 px-8 py-3 rounded-xl bg-violet shadow-2xl shadow-violet/30 border border-violet/50 hover:scale-105 transition-all text-sm font-black italic">
                           DEPLOY <Save size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="flex justify-center py-10 bg-black/40 rounded-[32px] border border-white/5 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-violet/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                     <div className="relative z-10 flex flex-col items-center gap-6">
                        <ProceduralNode seed={nodeSeed} color={newNode.color!} size={18} />
                        <div className="text-center font-mono opacity-20 text-[10px] font-black tracking-widest uppercase">
                           Neural Mesh: {nodeSeed}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black opacity-30 uppercase tracking-[2px]">Machine Name</label>
                        <input 
                          type="text" 
                          value={newNode.name} 
                          onChange={e => setNewNode({...newNode, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-violet/40"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black opacity-30 uppercase tracking-[2px]">Tech Tier</label>
                        <select 
                          value={newNode.tier} 
                          onChange={e => setNewNode({...newNode, tier: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none appearance-none"
                        >
                           <option value="basic">Basic Node</option>
                           <option value="advanced">Advanced Node</option>
                           <option value="elite">Elite Core</option>
                           <option value="quantum">Quantum Cell</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black opacity-30 uppercase tracking-[2px]">Yield (Pts/h)</label>
                        <input 
                          type="number" 
                          value={newNode.baseYield} 
                          onChange={e => setNewNode({...newNode, baseYield: parseInt(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black opacity-30 uppercase tracking-[2px]">Theme Color</label>
                        <input 
                          type="color" 
                          value={newNode.color} 
                          onChange={e => setNewNode({...newNode, color: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl p-1 cursor-pointer"
                        />
                     </div>
                  </div>
               </div>

               {/* Inventory list */}
               <div className="space-y-6">
                  {nodes.map(node => (
                    <div key={node.id} className="liquid-glass p-8 rounded-[40px] border-white/5 flex items-center justify-between group">
                       <div className="flex items-center gap-6">
                          <ProceduralNode seed={node.art || '0'} color={node.color} size={6} />
                          <div>
                             <h4 className="font-black italic text-xl uppercase tracking-tighter">{node.name}</h4>
                             <div className="flex gap-3 text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">
                                <span className={node.tier === 'quantum' ? 'text-primary' : node.tier === 'elite' ? 'text-violet' : ''}>{node.tier}</span>
                                <span>•</span>
                                <span>{node.baseYield} PTS/H</span>
                             </div>
                          </div>
                       </div>
                       <button 
                         onClick={() => deleteNode(node.id)}
                         className="p-4 rounded-2xl bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                       >
                         <Trash2 size={20} />
                       </button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="liquid-glass rounded-[48px] overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[3px] opacity-30">Ciudadano</th>
                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[3px] opacity-30">Privilegios</th>
                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[3px] opacity-30">Balances</th>
                        <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[3px] opacity-30 text-right">Kernel Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {users.map(u => (
                        <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-5">
                               <img src={u.photoURL || `https://api.dicebear.com/7.x/shapes/svg?seed=${u.uid}`} className="w-12 h-12 rounded-2xl" />
                               <div>
                                  <div className="font-black text-white">{u.displayName || 'ANONYMOUS'}</div>
                                  <div className="text-[10px] opacity-20">{u.email}</div>
                               </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                             <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${u.isAdmin ? 'bg-violet/20 text-violet border border-violet/30' : 'bg-white/5 text-white/40'}`}>
                               {u.isAdmin ? 'Administrador' : 'Ciudadano'}
                             </span>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex flex-col gap-1">
                                <div className="text-green-400 font-bold text-xs">${(u.usdtBalance || 0).toFixed(2)}</div>
                                <div className="text-violet font-bold text-xs">{u.points?.toLocaleString() || 0} PTS</div>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <button className="p-3 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                               <Settings size={16} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
