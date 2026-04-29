import { useState, useEffect } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment, writeBatch, serverTimestamp, collection } from 'firebase/firestore';
import { UserProfile, Cosmetic, MiningNode, SystemConfig } from '../types';

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to System Config
    const unsubConfig = onSnapshot(doc(db, 'system', 'config'), (snap) => {
      if (snap.exists()) setSystemConfig({ id: snap.id, ...snap.data() } as SystemConfig);
    });

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const docRef = doc(db, 'users', fbUser.uid);
        const unsubDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            const adminEmails = ['Belcore.Lorenzo@gmail.com', 'jdd10052@gmail.com'];
            if (fbUser.email && adminEmails.includes(fbUser.email) && !data.isAdmin) {
              updateDoc(docRef, { isAdmin: true });
            }
            setUser(data);
          } else {
            const newUser: UserProfile = {
              uid: fbUser.uid,
              points: 100,
              usdtBalance: 0,
              liked: [],
              disliked: [],
              watchedHalf: [],
              completed: [],
              unlocked: ['v1', 'v4', 'v9'],
              commented: [],
              lastDaily: null,
              xp: 0,
              displayName: fbUser.displayName || '',
              photoURL: fbUser.photoURL || '',
              bio: '',
              inventory: [],
              roles: [],
              isAdmin: fbUser.email === 'Belcore.Lorenzo@gmail.com' || fbUser.email === 'jdd10052@gmail.com',
              activeCosmetics: {}
            };
            setDoc(docRef, newUser).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${fbUser.uid}`));
            setUser(newUser);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        });

        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => { unsubConfig(); unsubAuth(); };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        alert('Este dominio no está autorizado en la consola de Firebase. Por favor, abre la app en una nueva pestaña o añade el dominio a la lista blanca.');
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!auth.currentUser || !user) return;
    const docRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(docRef, updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  const addPoints = async (pts: number) => {
    if (!auth.currentUser) return;
    const docRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(docRef, {
        points: increment(pts),
        xp: increment(pts)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  const purchaseCosmetic = async (cosmetic: Cosmetic) => {
    if (!user || user.points < cosmetic.cost) throw new Error('Puntos insuficientes');
    const docRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(docRef, {
        points: increment(-cosmetic.cost),
        inventory: [...(user.inventory || []), cosmetic.id]
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const purchaseNode = async (node: MiningNode) => {
    if (!user) return;
    const multiplier = systemConfig?.nodePriceMultiplier || 1.0;
    const finalCost = Math.round(node.cost * multiplier);
    
    if (user.points < finalCost) throw new Error('Saldo insuficiente');
    const userRef = doc(db, 'users', user.uid);
    const nodeRef = doc(collection(db, 'userNodes'));
    const floatValue = Math.random();

    const batch = writeBatch(db);
    batch.update(userRef, { points: increment(-finalCost) });
    batch.set(nodeRef, {
      userId: user.uid,
      nodeId: node.id,
      name: node.name,
      floatValue,
      status: 'offline',
      lastActivation: null,
      overclockLevel: 0,
      createdAt: serverTimestamp()
    });

    try {
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'purchase-node');
    }
  };

  const activateNode = async (userNodeId: string) => {
    const nodeRef = doc(db, 'userNodes', userNodeId);
    try {
      await updateDoc(nodeRef, {
        status: 'online',
        lastActivation: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'activate-node');
    }
  };

  const overclockNode = async (userNodeId: string) => {
    const nodeRef = doc(db, 'userNodes', userNodeId);
    const snap = await getDoc(nodeRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const newFloat = data.floatValue + 0.05 + (Math.random() * 0.05);
    
    try {
      await updateDoc(nodeRef, {
        overclockLevel: increment(1),
        floatValue: newFloat,
        status: newFloat >= 1.0 ? 'burnt' : data.status
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'overclock-node');
    }
  };

  const collectEarnings = async (userNodeId: string, earnings: number) => {
    if (!user || earnings <= 0) return;
    const yieldMultiplier = systemConfig?.globalYieldMultiplier || 1.0;
    const finalEarnings = Math.round(earnings * yieldMultiplier);
    
    const userRef = doc(db, 'users', user.uid);
    const nodeRef = doc(db, 'userNodes', userNodeId);
    const batch = writeBatch(db);
    batch.update(userRef, { points: increment(finalEarnings) });
    batch.update(nodeRef, { status: 'offline', lastActivation: null });
    
    try {
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'collect-earnings');
    }
  };

  const swapPointsForUSDT = async (points: number) => {
    if (!user || user.points < points) throw new Error('Puntos insuficientes');
    const rate = systemConfig?.pointsToUsdtRate || 10000;
    const usdt = points / rate;
    const userRef = doc(db, 'users', user.uid);
    
    try {
      await updateDoc(userRef, {
        points: increment(-points),
        usdtBalance: increment(usdt)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'swap-points-usdt');
      throw e;
    }
  };

  const createTrade = async (targetUserId: string | null, offer: { points?: number, usdt?: number, nodes?: string[] }, request: { points?: number, usdt?: number, nodes?: string[] }) => {
    if (!user) return;
    
    if (offer.points && user.points < offer.points) throw new Error('Puntos insuficientes');
    if (offer.usdt && user.usdtBalance < offer.usdt) throw new Error('Saldo USDT insuficiente');
    
    const tradeRef = doc(collection(db, 'trades'));
    const senderRef = doc(db, 'users', user.uid);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);

    const batch = writeBatch(db);
    if (offer.points) batch.update(senderRef, { points: increment(-offer.points) });
    if (offer.usdt) batch.update(senderRef, { usdtBalance: increment(-offer.usdt) });
    
    batch.set(tradeRef, {
      senderId: user.uid,
      senderName: user.displayName || 'Anónimo',
      receiverId: targetUserId || 'PUBLIC',
      senderPoints: offer.points || 0,
      senderUSDT: offer.usdt || 0,
      senderNodes: offer.nodes || [],
      receiverPoints: request.points || 0,
      receiverUSDT: request.usdt || 0,
      receiverNodes: request.nodes || [],
      senderAccepted: true,
      receiverAccepted: false,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: expiresAt.toISOString(),
      commission: 0
    });

    try {
      await batch.commit();
      return tradeRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'create-multi-trade');
      throw e;
    }
  };

  const confirmTrade = async (tradeId: string) => {
    if (!user) return;
    const tradeRef = doc(db, 'trades', tradeId);
    const tradeSnap = await getDoc(tradeRef);
    if (!tradeSnap.exists()) return;
    
    const tradeData = tradeSnap.data();
    if (tradeData.status !== 'pending') throw new Error('Esta oferta ya no está disponible');
    if (tradeData.senderId === user.uid) throw new Error('No puedes comprar tu propia oferta');

    if (tradeData.receiverPoints > user.points) throw new Error('Puntos insuficientes');
    if (tradeData.receiverUSDT > user.usdtBalance) throw new Error('Saldo USDT insuficiente');

    const batch = writeBatch(db);
    const senderRef = doc(db, 'users', tradeData.senderId);
    const receiverRef = doc(db, 'users', user.uid);

    if (tradeData.receiverPoints > 0) {
      batch.update(receiverRef, { points: increment(-tradeData.receiverPoints) });
      batch.update(senderRef, { points: increment(tradeData.receiverPoints) });
    }
    if (tradeData.receiverUSDT > 0) {
      batch.update(receiverRef, { usdtBalance: increment(-tradeData.receiverUSDT) });
      batch.update(senderRef, { usdtBalance: increment(tradeData.receiverUSDT) });
    }

    if (tradeData.senderPoints > 0) batch.update(receiverRef, { points: increment(tradeData.senderPoints) });
    if (tradeData.senderUSDT > 0) batch.update(receiverRef, { usdtBalance: increment(tradeData.senderUSDT) });

    if (tradeData.senderNodes && tradeData.senderNodes.length > 0) {
      tradeData.senderNodes.forEach((nodeId: string) => {
        batch.update(doc(db, 'userNodes', nodeId), { userId: user.uid });
      });
    }
    if (tradeData.receiverNodes && tradeData.receiverNodes.length > 0) {
      tradeData.receiverNodes.forEach((nodeId: string) => {
        batch.update(doc(db, 'userNodes', nodeId), { userId: tradeData.senderId });
      });
    }

    batch.update(tradeRef, { 
      receiverId: user.uid,
      receiverAccepted: true, 
      status: 'completed' 
    });

    try {
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'confirm-multi-trade');
      throw e;
    }
  };

  const cancelTrade = async (tradeId: string) => {
    if (!user) return;
    const tradeRef = doc(db, 'trades', tradeId);
    const tradeSnap = await getDoc(tradeRef);
    if (!tradeSnap.exists()) return;

    const tradeData = tradeSnap.data();
    if (tradeData.status !== 'pending') return;

    const batch = writeBatch(db);
    const senderRef = doc(db, 'users', tradeData.senderId);

    batch.update(tradeRef, { status: 'cancelled' });
    if (tradeData.senderPoints > 0) batch.update(senderRef, { points: increment(tradeData.senderPoints) });
    if (tradeData.senderUSDT > 0) batch.update(senderRef, { usdtBalance: increment(tradeData.senderUSDT) });

    try {
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'cancel-multi-trade');
    }
  };

  const incrementViews = async (videoId: string) => {
    const videoRef = doc(db, 'videos', videoId);
    try {
      await updateDoc(videoRef, { views: increment(1) });
    } catch(e) {}
  };

  return { 
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
  };
}
