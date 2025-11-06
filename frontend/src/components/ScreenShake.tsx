// frontend/src/components/ScreenShake.tsx

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScreenShakeProps {
  shake: boolean;
  intensity?: 'medium' | 'high';
  children: ReactNode;
}

export function ScreenShake({ shake, intensity = 'medium', children }: ScreenShakeProps) {
  const shakeValues = {
    medium: { x: [-5, 5, -5, 5, 0], y: [0, 3, -3, 3, 0] },
    high: { x: [-10, 10, -10, 10, 0], y: [0, 5, -5, 5, 0] },
  };

  return (
    <motion.div
      animate={
        shake
          ? {
              x: shakeValues[intensity].x,
              y: shakeValues[intensity].y,
            }
          : {}
      }
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
