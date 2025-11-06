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

  // Sub-component: Spinning reel (infinite scroll)
  const SpinningReel = ({ index }: { index: number }) => {
    const randomValues = generateRandomReelValues(REEL_CONFIG.valuesPerCycle);

    return (
      <motion.div
        className="absolute inset-0 flex flex-col items-center gap-8"
        animate={{ y: [0, REEL_CONFIG.scrollDistance] }}
        transition={{
          duration: REEL_CONFIG.spinDuration / 1000,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {randomValues.map((value, i) => (
          <div
            key={`${index}-${i}`}
            className="text-5xl font-bold text-gray-400"
            style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
          >
            {formatReelValue(value)}
          </div>
        ))}
      </motion.div>
    );
  };

  // Sub-component: Stopping reel (deceleration)
  const StoppingReel = ({ value }: { value: number }) => {
    return (
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ y: -400 }}
        animate={{ y: 0 }}
        transition={{
          duration: REEL_CONFIG.decelerationDuration / 1000,
          ease: [0.16, 1, 0.3, 1], // Deceleration cubic-bezier
        }}
      >
        <div
          className={`text-6xl font-bold ${getValueTierColor(value)}`}
          style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
        >
          {formatReelValue(value)}
        </div>
      </motion.div>
    );
  };

  // Sub-component: Stopped reel (pop animation with glow)
  const StoppedReel = ({ value }: { value: number }) => {
    return (
      <motion.div className="absolute inset-0 flex items-center justify-center">
        {/* Value with pop animation */}
        <motion.div
          initial={{ scale: 0.8, filter: 'brightness(0.5)' }}
          animate={{
            scale: [0.8, 1.15, 1.0],
            filter: [
              'brightness(0.5)',
              'brightness(1.5)',
              'brightness(1)',
            ],
          }}
          transition={{
            duration: 0.4,
            times: [0, 0.6, 1],
            ease: 'easeOut',
          }}
          className={`text-6xl font-bold ${getValueTierColor(value)} ${getValueTierGlow(value)}`}
        >
          {formatReelValue(value)}
        </motion.div>

        {/* Glow pulse ring */}
        <motion.div
          className={`absolute inset-0 rounded-lg border-4 ${getValueTierBorder(value)}`}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.8, 0, 0],
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </motion.div>
    );
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

                    {/* Reel viewport with state-based rendering */}
                    <div className="h-56 flex items-center justify-center relative overflow-hidden">
                      {/* Fade masks for depth */}
                      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-gray-900 via-gray-900/50 to-transparent pointer-events-none z-10" />
                      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none z-10" />

                      <AnimatePresence mode="wait">
                        {reelStates[index] === 'spinning' && (
                          <SpinningReel key="spinning" index={index} />
                        )}
                        {reelStates[index] === 'stopping' && (
                          <StoppingReel
                            key="stopping"
                            value={reelValues[index]}
                          />
                        )}
                        {reelStates[index] === 'stopped' && (
                          <StoppedReel
                            key="stopped"
                            value={reelValues[index]}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Glow effect - brighter when stopped */}
                  <motion.div
                    animate={{
                      opacity:
                        reelStates[index] === 'stopped'
                          ? [0.5, 1, 0.5]
                          : [0.3, 0.6, 0.3],
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
