import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface ProceduralNodeProps {
  seed?: string;
  data?: string[]; // Flat array of 144 elements
  color: string;
  isActive?: boolean;
  size?: number;
  className?: string;
}

export function ProceduralNode({ seed, data, color, isActive = false, size = 6, className = "" }: ProceduralNodeProps) {
  const pixelData = useMemo(() => {
    if (data) return data;
    if (!seed) return Array(144).fill(' ');

    const stringToSeed = (s: string) => {
      let hash = 0;
      for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash) + s.charCodeAt(i);
      return hash;
    };
    
    let currentSeed = stringToSeed(seed);
    const random = () => {
      currentSeed = (currentSeed * 16807) % 2147483647;
      return (currentSeed - 1) / 2147483646;
    };

    const matrix: string[] = Array(144).fill(' ');
    
    // Create symmetry on a 12x12 grid
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 6; x++) {
        // Border logic
        const isEdge = x === 0 || x === 11 || y === 0 || y === 11;
        const isInner = x >= 4 && x <= 7 && y >= 4 && y <= 7;
        
        let char = ' ';
        const r = random();
        
        if (isEdge) {
          if (r > 0.6) char = '#';
        } else if (isInner) {
          char = r > 0.3 ? '.' : '#';
        } else {
          if (r > 0.5) char = '#';
          if (r > 0.85) char = '.';
        }

        const idx = y * 12 + x;
        const mirrorIdx = y * 12 + (11 - x);
        matrix[idx] = char;
        matrix[mirrorIdx] = char;
      }
    }
    
    return matrix;
  }, [seed, data]);

  return (
    <div 
      className={`grid gap-0 ${className}`} 
      style={{ 
        gridTemplateColumns: `repeat(12, 1fr)`,
        width: 12 * size,
        height: 12 * size
      }}
    >
      {pixelData.map((pixel, i) => (
        <motion.div
          key={i}
          animate={isActive && pixel !== ' ' ? {
            opacity: [0.7, 1, 0.7],
            filter: [`drop-shadow(0 0 2px ${pixel === '#' ? color : '#fff'}cc)`, `drop-shadow(0 0 6px ${pixel === '#' ? color : '#fff'}ee)`, `drop-shadow(0 0 2px ${pixel === '#' ? color : '#fff'}cc)`]
          } : {}}
          transition={{ repeat: Infinity, duration: 2 + (i % 5) * 0.5 }}
          className="w-full h-full"
          style={{ 
            backgroundColor: pixel === '#' ? color : pixel === '.' ? '#fff' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}
