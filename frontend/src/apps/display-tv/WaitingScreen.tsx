import { motion } from 'framer-motion';
import { Card, CardBody } from '../../components';

interface WaitingScreenProps {
  playerName: string;
}

export function WaitingScreen({ playerName }: WaitingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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

      <Card className="w-full max-w-6xl">
        <CardBody className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-5xl font-bold text-gray-300 mb-6">
                Ready, {playerName.split(' ')[0]}?
              </h2>
              <h1 className="text-8xl font-bold text-primary-500">
                Press The Big Red Button!
              </h1>
            </div>

            {/* Animated button indicator - larger for TV */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex justify-center py-12"
            >
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-2xl flex items-center justify-center">
                  <div className="text-white text-5xl font-bold">PRESS</div>
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
                  className="absolute inset-0 border-8 border-red-500 rounded-full"
                />
              </div>
            </motion.div>

            <p className="text-gray-400 text-3xl">
              Waiting for you to press the button...
            </p>
          </motion.div>
        </CardBody>
      </Card>
    </div>
  );
}
