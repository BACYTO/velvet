import { Cosmetic } from '../types';

export const COSMETICS: Cosmetic[] = [
  {
    id: 'bg-nebula',
    name: 'Nebulosa Púrpura',
    type: 'background',
    cost: 50,
    previewUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80'
  },
  {
    id: 'bg-cyber',
    name: 'Cyberpunk City',
    type: 'background',
    cost: 120,
    previewUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80'
  },
  {
    id: 'frame-gold',
    name: 'Marco de Oro',
    type: 'frame',
    cost: 200,
    previewUrl: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&q=80'
  },
  {
    id: 'effect-fire',
    name: 'Plasma Storm',
    type: 'effect',
    cost: 500,
    previewUrl: 'https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80'
  },
  {
    id: 'effect-electric',
    name: 'Cyber Grid',
    type: 'effect',
    cost: 450,
    previewUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80'
  },
  {
    id: 'effect-void',
    name: 'Void Essence',
    type: 'effect',
    cost: 800,
    permissionRequired: 'VIP',
    previewUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80'
  }
];
