import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Link as LinkIcon, Type, FileText, Tag, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { VideoTier } from '../../types';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (video: any) => Promise<void>;
}

export function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    videoUrl: '',
    thumbUrl: '',
    cat: 'Drama',
    tier: 'free' as VideoTier,
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) return;
    
    setLoading(true);
    try {
      const newVideo = {
        title: formData.title,
        desc: formData.desc,
        videoUrl: formData.videoUrl,
        cat: formData.cat,
        tier: formData.tier,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        dur: '00:00',
        views: 0,
        likes: 0,
        dislikes: 0,
        bg: formData.thumbUrl ? `url("${formData.thumbUrl}")` : `linear-gradient(${Math.random() * 360}deg, #1a0b2e, #4a1d4a)`,
        createdAt: new Date().toISOString()
      };
      await onUpload(newVideo);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative liquid-glass w-full max-w-[500px] p-10 rounded-[40px] border-[#ffffff1a] overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 opacity-40 transition-colors">
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet/20 flex items-center justify-center text-violet">
            <Upload size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Subir Video</h2>
            <p className="text-xs opacity-40 uppercase tracking-widest font-bold">Añadir a la biblioteca</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-30 uppercase tracking-[2px] ml-4">Título del Video</label>
            <div className="relative">
              <Type size={16} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 outline-none focus:border-violet/40 transition-all text-sm"
                placeholder="Ej. Mi Tutorial Especial"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-30 uppercase tracking-[2px] ml-4">URL del Video (MP4)</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                required
                type="url"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 outline-none focus:border-violet/40 transition-all text-sm"
                placeholder="https://ejemplo.com/video.mp4"
                value={formData.videoUrl}
                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-30 uppercase tracking-[2px] ml-4">URL de la Miniatura (PNG/JPG)</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                type="url"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 outline-none focus:border-violet/40 transition-all text-sm"
                placeholder="https://ejemplo.com/tumb.jpg"
                value={formData.thumbUrl}
                onChange={e => setFormData({...formData, thumbUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold opacity-30 uppercase tracking-[2px] ml-4">Categoría</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-violet/40 transition-all text-sm appearance-none cursor-pointer"
                  value={formData.cat}
                  onChange={e => setFormData({...formData, cat: e.target.value})}
                >
                  {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c} className="bg-[#07050f] text-white">{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold opacity-30 uppercase tracking-[2px] ml-4">Nivel (Tier)</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-violet/40 transition-all text-sm appearance-none cursor-pointer"
                  value={formData.tier}
                  onChange={e => setFormData({...formData, tier: e.target.value as VideoTier})}
                >
                  <option value="free" className="bg-[#07050f] text-white">Gratis</option>
                  <option value="standard" className="bg-[#07050f] text-white">Standard</option>
                  <option value="premium" className="bg-[#07050f] text-white">Premium</option>
                  <option value="vip" className="bg-[#07050f] text-white">VIP</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-30 uppercase tracking-[2px] ml-4">Descripción</label>
            <div className="relative">
              <FileText size={16} className="absolute left-5 top-5 opacity-20" />
              <textarea 
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 outline-none focus:border-violet/40 transition-all text-sm min-h-[100px] resize-none"
                placeholder="Describe brevemente el contenido..."
                value={formData.desc}
                onChange={e => setFormData({...formData, desc: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-30 uppercase tracking-[2px] ml-4">Etiquetas (Separadas por comas)</label>
            <div className="relative">
              <Tag size={16} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-12 py-4 outline-none focus:border-violet/40 transition-all text-sm"
                placeholder="Ej. tutorial, intimo, vlog"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-violet rounded-2xl font-bold text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading ? 'Subiendo...' : 'Publicar Video'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
