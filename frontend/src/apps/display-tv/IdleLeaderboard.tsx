// frontend/src/apps/display-tv/IdleLeaderboard.tsx

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { Card, CardBody, Loading } from '../../components';
import { LEADERBOARD_ANIMATION, PODIUM_STYLES } from '../../config';

const getPodiumIcon = (rank: number): string | null => {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

const getPodiumStyles = (index: number) => {
  if (index === 0) return PODIUM_STYLES.first;
  if (index === 1) return PODIUM_STYLES.second;
  if (index === 2) return PODIUM_STYLES.third;
  return { bg: 'bg-gray-700', text: 'text-gray-300', gradient: 'from-gray-700 to-gray-800' };
};

export function IdleLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: apiClient.getLeaderboard.bind(apiClient),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Loading size="lg" message="Loading leaderboard..." />
      </div>
    );
  }

  const players = leaderboard?.players || [];

  return (
    <div className="min-h-screen p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
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

      {/* Moving light rays */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-7xl font-bold text-primary-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            Today's Leaderboard
          </h1>
          <p className="text-3xl text-gray-400">
            Top Performers - {leaderboard?.date}
          </p>
        </motion.div>

        {/* Leaderboard */}
        {players.length === 0 ? (
          <Card>
            <CardBody className="text-center py-20">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-4xl text-gray-400">
                  No spins yet today. Be the first!
                </p>
              </motion.div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {players.slice(0, 10).map((player, index) => {
              const styles = getPodiumStyles(index);
              const isPodium = index < 3;

              return (
                <motion.div
                  key={player.player_id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * (LEADERBOARD_ANIMATION.rowStagger / 1000),
                    duration: LEADERBOARD_ANIMATION.entryAnimation / 1000,
                  }}
                >
                  <Card className={`${
                    isPodium ? `border-4 ${index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-400' : 'border-orange-500'}` : ''
                  } ${isPodium ? 'bg-gradient-to-r ' + styles.gradient : ''}`}>
                    <CardBody className="py-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          {/* Rank */}
                          <div className="relative">
                            {/* Animated floating podium icon */}
                            {getPodiumIcon(player.rank) && (
                              <motion.span
                                className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl"
                                animate={{ y: [-5, 0, -5] }}
                                transition={{
                                  duration: LEADERBOARD_ANIMATION.medalBobDuration / 1000,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                  delay: index * 0.2,
                                }}
                              >
                                {getPodiumIcon(player.rank)}
                              </motion.span>
                            )}

                            {/* Rank badge with gradient */}
                            <div
                              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold ${styles.bg} ${styles.text} shadow-lg`}
                            >
                              {player.rank}
                            </div>
                          </div>

                          {/* Name */}
                          <div>
                            <h3 className={`text-4xl font-bold ${isPodium ? 'text-white' : 'text-white'}`}>
                              {player.name}
                            </h3>
                            <p className={`text-xl mt-2 ${isPodium ? 'text-gray-200' : 'text-gray-400'}`}>
                              {player.spin_count} spin{player.spin_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <p className={`text-5xl font-bold ${
                            index === 0 ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]' :
                            index === 1 ? 'text-gray-300 drop-shadow-[0_0_20px_rgba(209,213,219,0.6)]' :
                            index === 2 ? 'text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.6)]' :
                            'text-primary-500'
                          }`}>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0,
                            }).format(player.total_score)}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Attract message with pulsing glow */}
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: LEADERBOARD_ANIMATION.attractPulse / 1000,
            repeat: Infinity
          }}
          className="text-center pt-8"
        >
          <p className="text-4xl text-gray-300 font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Register on the iPad to play!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
