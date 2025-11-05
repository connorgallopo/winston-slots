import { motion } from 'framer-motion';
import { Card, CardBody, Button, ScoreDisplay, ReelValueDisplay } from '../../components';
import type { Player, Spin } from '../../types/api';

interface ResultsScreenProps {
  player: Player;
  spin: Spin;
  onPlayAgain: () => void;
}

export function ResultsScreen({ player, spin, onPlayAgain }: ResultsScreenProps) {
  const isBanana = (value: number) => value === 3_000_000;
  const hasBonus = spin.bonus_triggered;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-6xl space-y-8">
        {/* Celebration header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center space-y-4"
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
                className="text-7xl font-bold"
              >
                🍌 BONUS! 🍌
              </motion.h1>
              <p className="text-3xl text-gray-300">
                {spin.banana_count} Bananas! Bonus wheel activated!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-6xl font-bold text-primary-500">
                Nice Spin, {player.name.split(' ')[0]}!
              </h1>
              <p className="text-2xl text-gray-400">Here's what you won:</p>
            </>
          )}
        </motion.div>

        {/* Reel Values */}
        <Card>
          <CardBody className="p-8">
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
                className="mt-6 flex justify-center gap-4"
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
                    className="text-6xl"
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
            <CardBody className="py-12">
              <ScoreDisplay
                score={spin.total_score}
                label="Total Winnings"
                size="lg"
              />
              {spin.bonus_multiplier && spin.bonus_multiplier > 1 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mt-4 text-2xl text-green-500"
                >
                  {spin.bonus_multiplier}x Multiplier Applied!
                </motion.p>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-4"
        >
          {!hasBonus && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onPlayAgain}
            >
              Play Again
            </Button>
          )}
          {hasBonus && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => alert('Bonus wheel coming soon!')}
            >
              Spin the Bonus Wheel!
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
