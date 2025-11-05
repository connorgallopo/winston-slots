import { motion } from 'framer-motion';
import { Card, CardBody } from '../../components';
import type { Player } from '../../types/api';

interface WaitingScreenProps {
  player: Player;
}

export function WaitingScreen({ player }: WaitingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-3xl">
        <CardBody className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-300 mb-4">
                Ready, {player.name.split(' ')[0]}?
              </h2>
              <h1 className="text-6xl font-bold text-primary-500">
                Press The Big Red Button!
              </h1>
            </div>

            {/* Animated button indicator */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex justify-center py-8"
            >
              <div className="relative">
                <div className="w-48 h-48 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">PRESS</div>
                </div>
                {/* Pulsing ring effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="absolute inset-0 border-4 border-red-500 rounded-full"
                />
              </div>
            </motion.div>

            <p className="text-gray-400 text-xl">
              Waiting for you to press the button...
            </p>
          </motion.div>
        </CardBody>
      </Card>
    </div>
  );
}
