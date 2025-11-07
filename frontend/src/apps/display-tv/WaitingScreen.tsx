// frontend/src/apps/display-tv/WaitingScreen.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../../components';
import { TRANSITION_TIMING, SPRING_PRESETS } from '../../config';

interface WaitingScreenProps {
  playerName: string;
}

export function WaitingScreen({ playerName }: WaitingScreenProps) {
  const [countdown, setCountdown] = useState(Math.floor(TRANSITION_TIMING.readyCountdown / 1000));

  useEffect(() => {
    // Visual countdown that doesn't actually prevent spinning
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Ambient background shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent pointer-events-none"
        animate={{
          x: ['-100%', '100%'],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Moving spotlight glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Card className="w-full max-w-6xl relative z-10">
        <CardBody className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Player name greeting */}
            <div>
              <motion.h2
                className="text-6xl font-bold text-gray-300 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Ready, {playerName.split(' ')[0]}?
              </motion.h2>

              <motion.h1
                className="text-8xl font-bold text-primary-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.6)]"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                Press The Big Red Button!
              </motion.h1>
            </div>

            {/* Countdown timer */}
            {countdown > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING_PRESETS.standard}
              >
                <motion.p
                  className="text-9xl font-bold text-yellow-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                  key={countdown}
                >
                  {countdown}
                </motion.p>
              </motion.div>
            )}

            {/* Animated button indicator */}
            <motion.div
              animate={{
                scale: countdown === 0 ? [1, 1.3, 1] : [1, 1.15, 1],
                opacity: countdown === 0 ? [0.5, 1, 0.5] : [0.7, 1, 0.7],
              }}
              transition={{
                duration: countdown === 0 ? 1.5 : 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex justify-center py-12"
            >
              <div className="relative">
                <div className={`w-64 h-64 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl flex items-center justify-center ${
                  countdown === 0 ? 'shadow-red-500/50' : ''
                }`}>
                  <div className="text-white text-5xl font-bold">PRESS</div>
                </div>
                {/* Pulsing ring effect - more intense when ready */}
                <motion.div
                  animate={{
                    scale: countdown === 0 ? [1, 1.6] : [1, 1.4],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: countdown === 0 ? 1.5 : 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="absolute inset-0 border-8 border-red-500 rounded-full"
                />
              </div>
            </motion.div>

            <motion.p
              className="text-gray-400 text-3xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {countdown === 0 ? '🔥 Press now! 🔥' : 'Get ready...'}
            </motion.p>
          </motion.div>
        </CardBody>
      </Card>
    </div>
  );
}
