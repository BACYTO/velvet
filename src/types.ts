export type VideoTier = 'free' | 'standard' | 'premium' | 'vip';

export interface Video {
  id: string;
  title: string;
  desc: string;
  bg: string;
  videoUrl: string;
  dur: string;
  views: number;
  likes: number;
  dislikes: number;
  cat: string;
  tier: VideoTier;
  tags: string[];
  featured?: boolean;
}

export interface UserProfile {
  uid: string;
  points: number;
  usdtBalance: number;
  liked: string[];
  disliked: string[];
  watchedHalf: string[];
  completed: string[];
  unlocked: string[];
  commented: string[];
  lastDaily: string | null;
  xp: number;
  displayName?: string;
  bio?: string;
  photoURL?: string;
  roles?: string[];
  isAdmin?: boolean;
  inventory?: string[];
  activeCosmetics?: {
    background?: string;
    frame?: string;
    effect?: string;
  };
}

export interface Cosmetic {
  id: string;
  name: string;
  type: 'background' | 'frame' | 'effect';
  cost: number;
  previewUrl: string;
  permissionRequired?: string;
}

export interface Trade {
  id: string;
  senderId: string;
  receiverId: string;
  senderPoints: number;
  receiverPoints: number;
  senderUSDT: number;
  receiverUSDT: number;
  senderNodes: string[]; // IDs of UserNode
  receiverNodes: string[]; // IDs of UserNode
  senderAccepted: boolean;
  receiverAccepted: boolean;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  createdAt: any;
  expiresAt: any;
  commission: number;
}

export interface Comment {
  id?: string;
  videoId: string;
  userId: string;
  userName: string;
  text: string;
  color: string;
  createdAt: any;
}

export interface MiningNode {
  id: string;
  name: string;
  tier: 'basic' | 'advanced' | 'elite' | 'quantum';
  baseYield: number; // Puntos por hora
  activationInterval: number; // En horas
  cost: number;
  art: string;
  pixelArt: string[]; // Flattened 12x12 grid (144 elements)
  color: string;
  icon: 'Zap' | 'Cpu' | 'Box' | 'Activity' | 'Flame';
  desc: string;
}

export interface UserNode {
  id: string;
  userId: string;
  nodeId: string;
  name: string;
  floatValue: number; // Main float
  metaFloats: {
    hash: number;
    clock: number;
    temp: number;
    integrity: number;
  };
  status: 'online' | 'offline' | 'burnt';
  lastActivation: any;
  overclockLevel: number;
  customSeed: string; // For procedural pixel art
}

export const TIER_COSTS: Record<VideoTier, number> = {
  free: 0,
  standard: 30,
  premium: 80,
  vip: 200
};

export const XP_LEVELS = [
  { name: 'Curioso', range: [0, 99] },
  { name: 'Aficionado', range: [100, 299] },
  { name: 'Experto', range: [300, 699] },
  { name: 'Veterano', range: [700, 1499] },
  { name: 'Maestro', range: [1500, Infinity] }
];

export interface SystemConfig {
  id: string;
  pointsToUsdtRate: number; // e.g. 1000 pts = 1 USDT
  nodePriceMultiplier: number; // e.g. 1.0 (base)
  totalPointsInCirculation: number;
  totalUsdtReserve: number;
  lastAudit: any; // Timestamp
  globalYieldMultiplier: number;
}
