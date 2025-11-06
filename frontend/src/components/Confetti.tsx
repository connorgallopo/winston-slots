// frontend/src/components/Confetti.tsx

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ConfettiProps {
  count?: number;
  colors?: string[];
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
}

export function Confetti({
  count = 50,
  colors = ['#F59E0B', '#FCD34D', '#F97316', '#EF4444'],
  duration = 3,
}: ConfettiProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50, // -50 to 50
      y: Math.random() * -100 - 50, // -150 to -50
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
    }));
  }, [count, colors]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: particle.color,
            left: '50%',
            top: '20%',
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: particle.x * 10,
            y: particle.y * 10,
            rotate: particle.rotation * 4,
            opacity: 0,
          }}
          transition={{
            duration: duration,
            delay: particle.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
}
