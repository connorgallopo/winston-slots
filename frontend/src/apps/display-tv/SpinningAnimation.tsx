import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../../components';
import type { Spin } from '../../types/api';
import {
  REEL_NAMES,
  REEL_CONFIG,
  getValueTierColor,
  getValueTierBorder,
  getValueTierGlow,
  formatReelValue,
  generateRandomReelValues,
} from '../../utils/reelTiers';

interface SpinningAnimationProps {
  spin: Spin;
}

type ReelState = 'spinning' | 'stopping' | 'stopped';

export function SpinningAnimation({ spin }: SpinningAnimationProps) {
  const [reelStates, setReelStates] = useState<ReelState[]>(
    Array(5).fill('spinning')
  );

  // Sequential stop timing: left-to-right cascade
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    REEL_NAMES.forEach((_, index) => {
      // Start stopping animation (deceleration phase)
      const stopTimer = setTimeout(() => {
        setReelStates((prev) =>
          prev.map((state, i) => (i === index ? 'stopping' : state))
        );
      }, REEL_CONFIG.spinDuration + index * REEL_CONFIG.stopDelay);

      // Mark as fully stopped (for pop animation)
      const completeTimer = setTimeout(() => {
        setReelStates((prev) =>
          prev.map((state, i) => (i === index ? 'stopped' : state))
        );
      }, REEL_CONFIG.spinDuration + REEL_CONFIG.decelerationDuration + index * REEL_CONFIG.stopDelay);

      timers.push(stopTimer, completeTimer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const reelValues = [
    spin.zillow_value,
    spin.realtor_value,
    spin.homes_value,
    spin.google_value,
    spin.smart_sign_value,
  ];

  const formatValue = (value: number) => {
    if (value === 3_000_000) return '🍌';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-7xl space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-7xl font-bold text-primary-500">
            Spinning...
          </h1>
        </motion.div>

        {/* Reels */}
        <Card>
          <CardBody className="p-12">
            <div className="grid grid-cols-5 gap-8">
              {REEL_NAMES.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Reel container */}
                  <div className="bg-gray-900 rounded-xl p-8 border-4 border-primary-500 shadow-2xl overflow-hidden">
                    {/* Reel label */}
                    <div className="text-center mb-6">
                      <p className="text-lg font-semibold text-gray-400 uppercase tracking-wide">
                        {name}
                      </p>
                    </div>

                    {/* Spinning animation or final value */}
                    <div className="h-56 flex items-center justify-center relative overflow-hidden">
                      {!showValues ? (
                        <motion.div
                          animate={{
                            y: [0, -400],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: index * 0.2,
                          }}
                          className="absolute inset-0 flex flex-col items-center gap-8"
                        >
                          {['$200K', '$500K', '$1M', '$3M', '🍌', '$750K', '$300K'].map(
                            (value, i) => (
                              <motion.div
                                key={i}
                                className="text-5xl font-bold text-white"
                                style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
                              >
                                {value}
                              </motion.div>
                            )
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: index * 0.1,
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                          }}
                          className="text-6xl font-bold text-white"
                          style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
                        >
                          {formatValue(reelValues[index])}
                        </motion.div>
                      )}

                      {/* Blur gradient edges */}
                      {!showValues && (
                        <>
                          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none" />
                          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      opacity: showValues ? [0.5, 1, 0.5] : [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                    className="absolute inset-0 bg-primary-500/20 rounded-xl blur-xl -z-10"
                  />
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
