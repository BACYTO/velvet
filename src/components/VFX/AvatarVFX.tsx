import React, { useEffect, useRef } from 'react';

type VFXType = 'fuego' | 'electric' | 'void' | 'none';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

class ParticleEngine {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private type: VFXType;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number, type: VFXType) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.type = type;
  }

  public updateType(type: VFXType) {
    this.type = type;
    this.particles = [];
  }

  private createParticle(): Particle {
    const angle = Math.random() * Math.PI * 2;
    const radius = (this.width / 2) * 0.85; // Cerca del borde del círculo
    
    // Posición inicial en el borde del círculo
    const x = this.width / 2 + Math.cos(angle) * radius;
    const y = this.height / 2 + Math.sin(angle) * radius;

    let vx = 0, vy = 0, size = 0, color = '', maxLife = 0;

    switch (this.type) {
      case 'fuego':
        vx = (Math.random() - 0.5) * 0.5;
        vy = -Math.random() * 1.5 - 0.5; // Hacia arriba
        size = Math.random() * 3 + 1;
        color = `hsla(${Math.random() * 20 + 10}, 100%, 50%, `; // Naranja/Rojo
        maxLife = 40 + Math.random() * 20;
        break;
      case 'electric':
        vx = (Math.random() - 0.5) * 4;
        vy = (Math.random() - 0.5) * 4;
        size = Math.random() * 2 + 0.5;
        color = `hsla(${Math.random() * 40 + 180}, 100%, 70%, `; // Cyan/Blue
        maxLife = 10 + Math.random() * 10;
        break;
      case 'void':
        // Succión hacia el centro
        const dx = (this.width / 2) - x;
        const dy = (this.height / 2) - y;
        vx = dx * 0.02 + (Math.random() - 0.5);
        vy = dy * 0.02 + (Math.random() - 0.5);
        size = Math.random() * 4 + 2;
        color = `hsla(${Math.random() * 60 + 260}, 100%, 40%, `; // Purpura/Negro
        maxLife = 60 + Math.random() * 30;
        break;
    }

    return { x, y, vx, vy, life: maxLife, maxLife, size, color };
  }

  public update() {
    if (this.type === 'none') return;

    // Generar nuevas partículas
    if (this.particles.length < 100) {
      for(let i = 0; i < 2; i++) this.particles.push(this.createParticle());
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'lighter';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const alpha = p.life / p.maxLife;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + alpha + ')';
      this.ctx.fill();

      // Glow extra para plasma/electric
      if (this.type !== 'void') {
        this.ctx.shadowBlur = 10 * alpha;
        this.ctx.shadowColor = p.color + '1)';
      }
    }
  }
}

export const AvatarVFX: React.FC<{ type: VFXType; size?: number }> = ({ type, size = 112 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const canvasSize = size * 1.5; // Padding for particles
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    ctx.scale(dpr, dpr);

    if (!engineRef.current) {
      engineRef.current = new ParticleEngine(ctx, canvasSize, canvasSize, type);
    } else {
      engineRef.current.updateType(type);
    }

    let frameId: number;
    const render = () => {
      engineRef.current?.update();
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [type, size]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <canvas 
        ref={canvasRef} 
        className="pointer-events-none"
        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' }}
      />
    </div>
  );
};
