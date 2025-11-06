import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, ScoreDisplay, ReelValueDisplay } from '../../components';
import type { Spin } from '../../types/api';

interface ResultsScreenProps {
  spin: Spin;
}

export function ResultsScreen({ spin }: ResultsScreenProps) {
  const hasBonus = spin.bonus_triggered;
  const [displayScore, setDisplayScore] = useState(0);

  // Animated count-up for total score
  useEffect(() => {
    const duration = 2000; // 2 second count-up
    const steps = 60;
    const increment = spin.total_score / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= spin.total_score) {
        setDisplayScore(spin.total_score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [spin.total_score]);

  return (
    <div className="min-h-screen flex items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-7xl space-y-12">
        {/* Celebration header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center space-y-6"
        >
          {hasBonus ? (
            <>
              <motion.h1
                animate={{
                  scale: [1, 1.1, 1],
                  color: ['#ef4444', '#f59e0b', '#ef4444'],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-9xl font-bold"
              >
                🍌 BONUS! 🍌
              </motion.h1>
              <p className="text-5xl text-gray-300">
                {spin.banana_count} Bananas! Bonus wheel activated!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-8xl font-bold text-primary-500">
                Congratulations!
              </h1>
              <p className="text-4xl text-gray-400">Here's what you won:</p>
            </>
          )}
        </motion.div>

        {/* Reel Values */}
        <Card>
          <CardBody className="p-12">
            <ReelValueDisplay
              values={{
                zillow: spin.zillow_value,
                realtor: spin.realtor_value,
                homes: spin.homes_value,
                google: spin.google_value,
                smartSign: spin.smart_sign_value,
              }}
            />

            {/* Banana indicators */}
            {spin.banana_count > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-center gap-6"
              >
                {[...Array(spin.banana_count)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.6 + i * 0.1,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="text-8xl"
                  >
                    🍌
                  </motion.span>
                ))}
              </motion.div>
            )}
          </CardBody>
        </Card>

        {/* Total Score */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardBody className="py-16">
              <ScoreDisplay
                score={displayScore}
                label="Total Winnings"
                size="lg"
              />
              {spin.bonus_multiplier && spin.bonus_multiplier > 1 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mt-6 text-4xl text-green-500"
                >
                  {spin.bonus_multiplier}x Multiplier Applied!
                </motion.p>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Auto-return message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center"
        >
          <p className="text-3xl text-gray-400">
            Returning to leaderboard...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
