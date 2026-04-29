import { MiningNode, Video } from './types';

export const CATEGORIES = ['Todos', 'Amateur', 'Anal', 'BDSM', 'Cosplay', 'Latina', 'MILF', 'POV', 'Reality', 'Solo'];

export const CATALOG: Video[] = [
  {
    id: 'v1',
    title: 'Velvet Sessions: Vol 1',
    desc: 'Una exploración profunda de los sentidos en ambiente controlado.',
    bg: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    dur: '08:24',
    views: 45200,
    likes: 1200,
    dislikes: 45,
    cat: 'POV',
    tier: 'free',
    tags: ['HD', 'Atmospheric'],
    featured: true
  },
  {
    id: 'v2',
    title: 'Neon Nights',
    desc: 'Bajo las luces de la ciudad, los secretos se revelan.',
    bg: 'https://images.unsplash.com/photo-1534010344710-18456886e969?q=80&w=1200',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    dur: '15:10',
    views: 89000,
    likes: 3400,
    dislikes: 120,
    cat: 'Reality',
    tier: 'standard',
    tags: ['Neon', 'Night'],
    featured: true
  },
  {
    id: 'v3',
    title: 'Pure Silk',
    desc: 'Suavidad y elegancia en cada movimiento.',
    bg: 'https://images.unsplash.com/photo-1514328525431-eac296c00024?q=80&w=1200',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    dur: '22:05',
    views: 120000,
    likes: 8900,
    dislikes: 300,
    cat: 'Amateur',
    tier: 'premium',
    tags: ['Silk', 'Soft'],
    featured: true
  }
];

export const NODE_TEMPLATES: MiningNode[] = [
  {
    id: 'core_v1',
    name: 'Velvet Core V1',
    tier: 'basic',
    baseYield: 2, 
    activationInterval: 2, 
    cost: 150,
    color: '#94a3b8', // Gray
    icon: 'Box',    desc: 'Basic entry-level storage and processing unit.',
    art: "",
    pixelArt: [
      " ", " ", " ", " ", "#", "#", "#", "#", " ", " ", " ", " ",
      " ", " ", " ", "#", "#", "#", "#", "#", "#", " ", " ", " ",
      " ", " ", "#", "#", "#", "#", "#", "#", "#", "#", " ", " ",
      " ", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", " ",
      " ", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", " ",
      " ", "#", "#", "#", ".", ".", ".", ".", "#", "#", "#", " ",
      " ", "#", "#", "#", ".", "#", "#", ".", "#", "#", "#", " ",
      " ", "#", "#", "#", ".", "#", "#", ".", "#", "#", "#", " ",
      " ", "#", "#", "#", ".", ".", ".", ".", "#", "#", "#", " ",
      " ", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", " ",
      " ", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", " ",
      " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
  },
  {
    id: 'core_v2',
    name: 'Neon ASIC X',
    tier: 'advanced',
    baseYield: 8, 
    activationInterval: 4, 
    cost: 500,
    color: '#22d3ee', // Cyan
    icon: 'Cpu',
    desc: 'High-speed logic processor for rapid hashing.',
    art: "",
    pixelArt: [
      " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ",
      " ", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", " ",
      " ", "#", ".", ".", ".", ".", ".", ".", ".", ".", "#", " ",
      " ", "#", ".", " ", " ", " ", " ", " ", " ", ".", "#", " ",
      " ", "#", ".", " ", "#", "#", "#", "#", " ", ".", "#", " ",
      " ", "#", ".", " ", "#", ".", ".", "#", " ", ".", "#", " ",
      " ", "#", ".", " ", "#", ".", ".", "#", " ", ".", "#", " ",
      " ", "#", ".", " ", "#", "#", "#", "#", " ", ".", "#", " ",
      " ", "#", ".", " ", " ", " ", " ", " ", " ", ".", "#", " ",
      " ", "#", ".", ".", ".", ".", ".", ".", ".", ".", "#", " ",
      " ", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", " ",
      " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
  },
  {
    id: 'core_v3',
    name: 'Onyx Quantum',
    tier: 'elite',
    baseYield: 25, 
    activationInterval: 12, 
    cost: 1200,
    color: '#fbbf24', // Amber/Gold
    icon: 'Zap',
    desc: 'Quantum-enhanced capacitor for massive energy density.',
    art: "",
    pixelArt: [
      " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " ",
      " ", " ", " ", " ", " ", "#", "#", "#", " ", " ", " ", " ",
      " ", " ", " ", " ", "#", "#", ".", "#", "#", " ", " ", " ",
      " ", " ", " ", "#", "#", ".", ".", ".", "#", "#", " ", " ",
      " ", " ", "#", "#", ".", ".", ".", ".", ".", "#", "#", " ",
      " ", "#", "#", ".", ".", ".", " ", ".", ".", ".", "#", "#",
      " ", "#", "#", ".", ".", ".", " ", ".", ".", ".", "#", "#",
      " ", " ", "#", "#", ".", ".", ".", ".", ".", "#", "#", " ",
      " ", " ", " ", "#", "#", ".", ".", ".", "#", "#", " ", " ",
      " ", " ", " ", " ", "#", "#", ".", "#", "#", " ", " ", " ",
      " ", " ", " ", " ", " ", "#", "#", "#", " ", " ", " ", " ",
      " ", " ", " ", " ", " ", " ", "#", " ", " ", " ", " ", " "
    ]
  },
  {
    id: 'core_v4',
    name: 'Singularity Zero',
    tier: 'quantum',
    baseYield: 100, 
    activationInterval: 24, 
    cost: 4000,
    color: '#c084fc', // Purple/Violet
    icon: 'Activity',
    desc: 'Transcendent processing core based on singularity theory.',
    art: "",
    pixelArt: [
      " ", " ", " ", " ", "#", "#", "#", "#", " ", " ", " ", " ",
      " ", " ", " ", "#", ".", ".", ".", ".", "#", " ", " ", " ",
      " ", " ", "#", ".", " ", " ", " ", " ", ".", "#", " ", " ",
      " ", "#", ".", " ", " ", " ", " ", " ", " ", ".", "#", " ",
      "#", ".", " ", " ", " ", "#", "#", " ", " ", " ", ".", "#",
      "#", ".", " ", " ", "#", "#", "#", "#", " ", " ", ".", "#",
      "#", ".", " ", " ", "#", "#", "#", "#", " ", " ", ".", "#",
      "#", ".", " ", " ", " ", "#", "#", " ", " ", " ", ".", "#",
      " ", "#", ".", " ", " ", " ", " ", " ", " ", ".", "#", " ",
      " ", " ", "#", ".", " ", " ", " ", " ", ".", "#", " ", " ",
      " ", " ", " ", "#", ".", ".", ".", ".", "#", " ", " ", " ",
      " ", " ", " ", " ", "#", "#", "#", "#", " ", " ", " ", " "
    ]
  }
];

export const getFloatLabel = (float: number) => {
  if (float <= 0.07) return { label: 'Factory New', color: 'text-primary', multiplier: 1.5 };
  if (float <= 0.15) return { label: 'Minimal Wear', color: 'text-green-400', multiplier: 1.3 };
  if (float <= 0.38) return { label: 'Field-Tested', color: 'text-yellow-400', multiplier: 1.0 };
  if (float <= 0.45) return { label: 'Well-Worn', color: 'text-orange-400', multiplier: 0.8 };
  return { label: 'Battle-Scarred', color: 'text-red-500', multiplier: 0.5 };
};

export const getFloatMultiplier = (float: number) => {
  return getFloatLabel(float).multiplier;
};
