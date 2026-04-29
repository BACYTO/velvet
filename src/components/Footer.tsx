import React from 'react';
import { CATEGORIES } from '../constants';

export function Footer() {
  return (
    <footer className="px-12 py-24 bg-[#07050f] border-t border-white/5 mt-24">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="font-display text-4xl font-bold text-gradient mb-6 leading-tight -tracking-[3px]">VELVET</div>
          <p className="max-w-sm opacity-40 text-sm leading-relaxed font-medium">Plataforma premium de entretenimiento para adultos. Comprometidos con la calidad 4k, el contenido consensuado y la mejor experiencia de usuario.</p>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest opacity-20 mb-6">Categorías</h4>
          <div className="flex flex-col gap-3 text-sm font-medium opacity-60">
            {CATEGORIES.slice(1, 6).map(c => <a key={c} href="#" className="hover:text-primary transition-colors">{c}</a>)}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest opacity-20 mb-6">Legal</h4>
          <div className="flex flex-col gap-3 text-sm font-medium opacity-60">
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">18 U.S.C. 2257</a>
            <a href="#" className="hover:text-primary transition-colors">Contacto</a>
          </div>
        </div>
      </div>
      <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 text-[10px] font-bold tracking-widest leading-loose text-center md:text-left">
        <div>© 2026 VELVET CONTENT. TODOS LOS DERECHOS RESERVADOS.</div>
        <div className="flex gap-8">
           <span>MADE WITH PASSION</span>
           <span>ESTRICTO CUMPLIMIENTO 18+</span>
        </div>
      </div>
    </footer>
  );
}
