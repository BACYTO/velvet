import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MESSAGES = [
  'Iniciando Protocolos Velvet...',
  'Sincronizando Nodes...',
  'Cargando Activos de Red...',
  'Verificando Credenciales...',
  'Estableciendo Conexión Escrow...',
  'Cifrando Contenido...',
  'Preparando Interfaz de Usuario...',
  'Listo para Operar'
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(MESSAGES[0]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        const inc = prev > 85 ? Math.random() * 0.3 : Math.random() * 2;
        const next = Math.min(prev + inc, 99);
        
        // Update message based on percentage
        const msgIdx = Math.floor((next / 100) * MESSAGES.length);
        setMessage(MESSAGES[Math.min(msgIdx, MESSAGES.length - 1)]);
        
        return next;
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] bg-[#07050f] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full animate-bounce duration-[10s]" />

      {/* Center Content */}
      <div className="relative text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display text-7xl font-black text-white italic tracking-tighter"
        >
          VELVET
        </motion.div>
        
        <div className="h-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[10px] font-black text-violet uppercase tracking-[4px]"
            >
              {message}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar Container at Bottom */}
      <div className="absolute bottom-20 left-10 right-10 max-w-2xl mx-auto">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[2px]">Cargando Sistema</span>
          <span className="text-xl font-black text-white italic">{Math.round(progress)}%</span>
        </div>
        
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-violet via-primary to-violet bg-[length:200%_auto] transition-all duration-300 rounded-full"
            style={{ animation: 'shimmer 2s linear infinite' }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}} />
    </div>
  );
}
