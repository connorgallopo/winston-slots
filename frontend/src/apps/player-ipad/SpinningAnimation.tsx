import { motion } from 'framer-motion';
import { Card, CardBody } from '../../components';
import type { Player } from '../../types/api';

interface SpinningAnimationProps {
  player: Player;
}

const REEL_NAMES = ['Zillow', 'Realtor', 'Homes.com', 'Google', 'Smart Sign'];

export function SpinningAnimation({ player }: SpinningAnimationProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-300">
            Good luck, {player.name.split(' ')[0]}!
          </h2>
          <h1 className="text-5xl font-bold text-primary-500 mt-2">
            Spinning...
          </h1>
        </motion.div>

        {/* Reels */}
        <Card>
          <CardBody className="p-8">
            <div className="grid grid-cols-5 gap-6">
              {REEL_NAMES.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Reel container */}
                  <div className="bg-gray-900 rounded-xl p-6 border-4 border-primary-500 shadow-2xl overflow-hidden">
                    {/* Reel label */}
                    <div className="text-center mb-4">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                        {name}
                      </p>
                    </div>

                    {/* Spinning animation */}
                    <div className="h-48 flex items-center justify-center relative overflow-hidden">
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
                              className="text-4xl font-bold text-white"
                              style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
                            >
                              {value}
                            </motion.div>
                          )
                        )}
                      </motion.div>

                      {/* Blur gradient edges */}
                      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
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
