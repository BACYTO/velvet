import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ThumbsUp, ThumbsDown, Send, Star } from 'lucide-react';
import { Video, UserProfile, Comment as CommentType } from '../../types';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface VideoModalProps {
  video: Video;
  user: UserProfile | null;
  onClose: () => void;
  onPointsEarned: (pts: number, reason: string) => void;
  addToast: (type: string, title: string, msg: string) => void;
  updateProfile: (u: Partial<UserProfile>) => void;
  onLogin: () => void;
}

export function VideoModal({ video, user, onClose, onPointsEarned, addToast, updateProfile, onLogin }: VideoModalProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [rewardTrack, setRewardTrack] = useState({ half: false, full: false });

  useEffect(() => {
    const q = query(collection(db, `videos/${video.id}/comments`), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentType)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `videos/${video.id}/comments`);
    });
  }, [video.id]);

  const handleTimeUpdate = (e: any) => {
    if (!user) return;
    const player = e.target;
    const perc = (player.currentTime / player.duration) * 100;
    
    if (perc >= 50 && !rewardTrack.half && !user.watchedHalf.includes(video.id)) {
      setRewardTrack(prev => ({ ...prev, half: true }));
      onPointsEarned(3, '50% Visto');
      updateProfile({ watchedHalf: [...user.watchedHalf, video.id] });
    }
    if (perc >= 90 && !rewardTrack.full && !user.completed.includes(video.id)) {
      setRewardTrack(prev => ({ ...prev, full: true }));
      onPointsEarned(7, '90% Visto');
      updateProfile({ completed: [...user.completed, video.id] });
    }
  };

  const postComment = async () => {
    if (!user) {
      addToast('warning', 'Ingreso Requerido', 'Inicia sesión para comentar y ganar puntos');
      onLogin();
      return;
    }
    if (commentText.trim().length < 3) return;
    const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    const data: any = {
      userId: user.uid,
      userName: user.displayName || `Usuario ${user.uid.substring(0, 4)}`,
      text: commentText,
      color,
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, `videos/${video.id}/comments`), data);
      
      if (commentText.length >= 20 && !user.commented.includes(video.id)) {
        onPointsEarned(3, 'Comentario');
        updateProfile({ commented: [...user.commented, video.id] });
      }
      setCommentText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `videos/${video.id}/comments`);
    }
  };

  const handleReaction = async (isLike: boolean) => {
    if (!user) {
      addToast('warning', 'Ingreso Requerido', 'Inicia sesión para reaccionar');
      onLogin();
      return;
    }
    if (isLike) {
      if (!user.liked.includes(video.id)) {
        onPointsEarned(2, 'Like');
        await updateProfile({ 
          liked: [...user.liked, video.id],
          disliked: user.disliked.filter((id: string) => id !== video.id)
        });
      }
    } else {
      if (!user.disliked.includes(video.id)) {
        onPointsEarned(1, 'Reacción');
        await updateProfile({ 
          disliked: [...user.disliked, video.id],
          liked: user.liked.filter((id: string) => id !== video.id)
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[6000] flex items-center justify-center md:p-10"
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose} />
      <motion.div 
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="relative liquid-glass w-full max-w-[1280px] md:h-full max-h-[900px] overflow-hidden md:rounded-[48px] border-[#ffffff14] flex flex-col"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-[10] w-12 h-12 rounded-full liquid-glass hover:bg-white/10 flex items-center justify-center text-white"><X size={24} /></button>
        
        <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] bg-black flex items-center justify-center">
          <video 
            key={video.id}
            src={video.videoUrl} 
            controls 
            autoPlay 
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-[#07050fef] text-white">
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <h2 className="font-display text-4xl mb-4 font-bold tracking-tight">{video.title}</h2>
            <div className="flex gap-6 text-sm opacity-40 mb-8 font-medium">
              <span>{video.views.toLocaleString()} vistas</span>
              <span>{video.dur}</span>
              <span className="text-violet uppercase tracking-widest">{video.cat}</span>
            </div>
            
            <div className="flex gap-4 mb-10">
              <button 
                onClick={() => handleReaction(true)}
                className={`px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-all ${
                  user?.liked.includes(video.id) ? 'bg-primary shadow-lg shadow-primary/20' : 'liquid-glass hover:bg-white/10'
                }`}
              >
                <ThumbsUp size={18} fill={user?.liked.includes(video.id) ? 'white' : 'none'} />
                <span>{video.likes + (user?.liked.includes(video.id) ? 1 : 0)}</span>
              </button>
              <button 
                onClick={() => handleReaction(false)}
                className={`px-8 py-3 rounded-full font-bold flex items-center gap-3 transition-all ${
                  user?.disliked.includes(video.id) ? 'bg-white/20' : 'liquid-glass hover:bg-white/10'
                }`}
              >
                <ThumbsDown size={18} fill={user?.disliked.includes(video.id) ? 'white' : 'none'} />
                <span>{video.dislikes + (user?.disliked.includes(video.id) ? 1 : 0)}</span>
              </button>
            </div>

            <p className="opacity-50 text-lg leading-relaxed mb-4">{video.desc}</p>
            <div className="flex gap-2 flex-wrap mb-10">
              {video.tags.map((t: string) => (
                <span key={t} className="px-5 py-2 liquid-glass rounded-full text-xs font-bold opacity-30 hover:opacity-100 cursor-pointer transition-opacity">#{t}</span>
              ))}
            </div>

            {!user && (
              <div className="p-8 rounded-3xl bg-violet/10 border border-violet/20 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-violet/20 flex items-center justify-center text-violet mb-4">
                  <Star size={24} fill="currentColor" />
                </div>
                <h4 className="font-bold text-xl mb-2">¡Gana puntos viendo videos!</h4>
                <p className="text-sm opacity-60 mb-6 max-w-[300px]">Regístrate con tu cuenta de Google para empezar a acumular puntos y desbloquear contenido exclusivo.</p>
                <button 
                  onClick={onLogin}
                  className="bg-violet text-white px-10 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Unirme Ahora
                </button>
              </div>
            )}
          </div>

          <div className="w-full md:w-[400px] flex flex-col border-l border-white/5 bg-black/20">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold tracking-tight opacity-60">Comentarios</h3>
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md opacity-40 uppercase tracking-widest font-bold">{comments.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-dashed border-white" />
                  <div className="font-bold text-sm tracking-widest text-center">SÉ EL PRIMERO <br/> EN COMENTAR</div>
                </div>
              ) : comments.map(c => (
                <div key={c.id} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm overflow-hidden" style={{ background: c.color }}>
                    {c.userName.substring(0, 1)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold opacity-40 mb-1 tracking-wider uppercase">{c.userName}</div>
                    <div className="text-sm opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/2 shadow-2xl relative">
              <input 
                type="text" 
                placeholder={user ? "Añadir comentario..." : "Inicia sesión para comentar"}
                disabled={!user}
                className="w-full bg-white/5 rounded-2xl px-6 py-4 outline-none text-sm border border-transparent focus:border-violet/30 transition-all pr-14 text-white disabled:opacity-50"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && postComment()}
              />
              <button 
                onClick={postComment}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-2 rounded-xl text-violet hover:text-primary transition-colors"
              >
                <Send size={20} />
              </button>
              {user && (
                <div className={`mt-3 text-center text-[9px] font-bold tracking-widest transition-opacity ${commentText.length >= 20 ? 'text-green-500' : 'opacity-20'}`}>
                  {commentText.length >= 20 ? 'RECOMPENSA ACTIVA (+3 PTS)' : '20+ CARACTERES PARA GANAR PUNTOS'}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
