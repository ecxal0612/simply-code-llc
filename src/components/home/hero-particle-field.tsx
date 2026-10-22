"use client";

import { useEffect, useRef } from "react";
import { cobaltRgb } from "~/lib/home/cobalt-theme";
import { cn } from "~/lib/utils";

type Particle = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  tone: "accent" | "neutral";
};

function buildParticles(width: number, height: number): Particle[] {
  const gap = width < 640 ? 32 : width < 1024 ? 28 : 24;
  const particles: Particle[] = [];

  for (let x = gap / 2; x < width; x += gap) {
    for (let y = gap / 2; y < height; y += gap) {
      const jitter = () => (Math.random() - 0.5) * gap * 0.45;
      particles.push({
        baseX: x + jitter(),
        baseY: y + jitter(),
        x: x + jitter(),
        y: y + jitter(),
        vx: 0,
        vy: 0,
        size: Math.random() * 1.1 + 0.65,
        phase: Math.random() * Math.PI * 2,
        tone: Math.random() > 0.72 ? "accent" : "neutral",
      });
    }
  }

  return particles;
}

export function HeroParticleField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999, inside: false });
  const rafRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const syncSize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = buildParticles(width, height);
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const inside =
        clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      pointerRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        inside,
      };
    };

    const onMouseMove = (event: MouseEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY);
    };

    const onPointerLeave = () => {
      pointerRef.current.inside = false;
    };

    let time = 0;

    const draw = () => {
      const { width, height } = container.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const repelRadius = Math.min(220, width * 0.28);
      const repelForce = reducedMotion ? 0 : 32;

      time += reducedMotion ? 0 : 0.014;

      for (const particle of particlesRef.current) {
        let targetX = particle.baseX;
        let targetY = particle.baseY;

        if (!reducedMotion) {
          const driftX =
            Math.sin(time + particle.phase + particle.baseY * 0.014) * 5.5 +
            Math.sin(time * 0.42 + particle.phase * 1.15 + particle.baseX * 0.007) * 2.6;
          const driftY =
            Math.cos(time * 0.74 + particle.phase + particle.baseX * 0.012) * 5.5 +
            Math.cos(time * 0.36 + particle.phase * 0.9 + particle.baseY * 0.008) * 2.6;
          targetX += driftX;
          targetY += driftY;

          if (pointer.inside) {
            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            const distance = Math.hypot(dx, dy) || 1;
            if (distance < repelRadius) {
              const influence = (1 - distance / repelRadius) ** 1.6;
              targetX += (dx / distance) * influence * repelForce;
              targetY += (dy / distance) * influence * repelForce;
            }
          }

          particle.vx += (targetX - particle.x) * 0.065;
          particle.vy += (targetY - particle.y) * 0.065;
          particle.vx *= 0.82;
          particle.vy *= 0.82;
          particle.x += particle.vx;
          particle.y += particle.vy;
        } else {
          particle.x = particle.baseX;
          particle.y = particle.baseY;
        }

        const pulse = reducedMotion ? 0.25 : (Math.sin(time * 1.4 + particle.phase) + 1) * 0.18;
        const alpha = particle.tone === "accent" ? 0.22 + pulse : 0.1 + pulse * 0.65;
        ctx.beginPath();
        ctx.fillStyle =
          particle.tone === "accent"
            ? `rgba(${cobaltRgb.dodger}, ${alpha})`
            : `rgba(228, 228, 231, ${alpha})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    syncSize();
    window.addEventListener("resize", syncSize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseout", onPointerLeave);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseout", onPointerLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" />
    </div>
  );
}
