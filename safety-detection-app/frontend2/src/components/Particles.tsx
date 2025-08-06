'use client';

import { useEffect, useRef } from 'react';

interface ParticlesProps {
  active: boolean;
  intensity?: number;
}

export default function Particles({ active, intensity = 1 }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
    glow: number;
    trail: boolean;
  }>>([]);
  const trailsRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    opacity: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles when active with intensity factor
    if (active && particlesRef.current.length < 80 * intensity) {
      const particleCount = Math.floor(80 * intensity);
      const currentCount = particlesRef.current.length;
      const newParticlesNeeded = particleCount - currentCount;
      
      for (let i = 0; i < newParticlesNeeded; i++) {
        // Create particles with more dynamic properties based on intensity
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (3 * intensity) + 1,
          speedX: (Math.random() - 0.5) * 3 * intensity,
          speedY: (Math.random() - 0.5) * 3 * intensity,
          opacity: Math.random() * 0.6 + 0.4,
          color: `hsl(${Math.random() * 80 + 190}, 100%, ${65 + Math.random() * 15}%)`, // Enhanced blue to purple hues
          glow: Math.random() * 10 * intensity,
          trail: Math.random() > 0.7 // Some particles leave trails
        });
      }
    }

    // Animation loop with enhanced effects
    let animationId: number;
    const animate = () => {
      // Apply a semi-transparent clear for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update trails first (behind particles)
      trailsRef.current.forEach((trail, index) => {
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
        
        // Add glow effect to trails
          const gradient = ctx.createRadialGradient(
            trail.x, trail.y, 0,
            trail.x, trail.y, trail.size * 2
          );
          gradient.addColorStop(0, trail.color.replace(')', ', ' + (trail.opacity * 0.8) + ')'));
          gradient.addColorStop(1, trail.color.replace(')', ', 0)'));
          
          ctx.fillStyle = gradient;
        ctx.fill();
        
        // Fade out trails
        trail.opacity -= 0.03;
        trail.size *= 0.97;
        
        if (trail.opacity <= 0 || trail.size <= 0.1) {
          trailsRef.current.splice(index, 1);
        }
      });

      // Draw and update particles with enhanced effects
      particlesRef.current.forEach((particle, index) => {
        // Add glow effect
        if (particle.glow > 0) {
          ctx.shadowBlur = particle.glow;
          ctx.shadowColor = particle.color;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Create gradient fill for more dynamic particles
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, particle.color.replace(')', ', ' + particle.opacity + ')'));
        gradient.addColorStop(1, particle.color.replace(')', ', ' + (particle.opacity * 0.5) + ')'));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Reset shadow for next particle
        ctx.shadowBlur = 0;

        // Add trail effect for some particles
        if (particle.trail && Math.random() > 0.7) {
          trailsRef.current.push({
            x: particle.x,
            y: particle.y,
            size: particle.size * 0.8,
            opacity: particle.opacity * 0.7,
            color: particle.color
          });
        }

        // Update position with intensity factor
        particle.x += particle.speedX * (active ? intensity : 1);
        particle.y += particle.speedY * (active ? intensity : 1);

        // Boundary check with bounce effect
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
          // Add slight variation to speed after bounce
          particle.speedX *= 0.95 + Math.random() * 0.1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
          // Add slight variation to speed after bounce
          particle.speedY *= 0.95 + Math.random() * 0.1;
        }

        // Fade out if not active
        if (!active) {
          particle.opacity -= 0.02;
          particle.glow *= 0.9;
          if (particle.opacity <= 0) {
            particlesRef.current.splice(index, 1);
          }
        }
      });

      if (particlesRef.current.length > 0 || trailsRef.current.length > 0 || active) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [active, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[101] mix-blend-screen"
      style={{ 
        opacity: active ? 0.85 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  );
}