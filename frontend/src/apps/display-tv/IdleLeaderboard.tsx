import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { Card, CardBody, Loading } from '../../components';

const getPodiumIcon = (rank: number): string | null => {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
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
    <div className="min-h-screen p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-7xl font-bold text-primary-500">
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
              <p className="text-4xl text-gray-400">
                No spins yet today. Be the first!
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {players.map((player, index) => (
              <motion.div
                key={player.player_id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className={index === 0 ? 'border-4 border-primary-500' : ''}>
                  <CardBody className="py-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        {/* Rank */}
                        <div className="relative">
                          {/* Animated podium icon */}
                          {getPodiumIcon(player.rank) && (
                            <motion.span
                              className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl"
                              animate={{ y: [-5, 0, -5] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            >
                              {getPodiumIcon(player.rank)}
                            </motion.span>
                          )}

                          {/* Rank badge */}
                          <div
                            className={`
                            w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold
                            ${index === 0 ? 'bg-yellow-500 text-gray-900' : ''}
                            ${index === 1 ? 'bg-gray-400 text-gray-900' : ''}
                            ${index === 2 ? 'bg-orange-600 text-white' : ''}
                            ${index > 2 ? 'bg-gray-700 text-gray-300' : ''}
                          `}
                          >
                            {player.rank}
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          <h3 className="text-4xl font-bold text-white">
                            {player.name}
                          </h3>
                          <p className="text-xl text-gray-400 mt-2">
                            {player.spin_count} spin{player.spin_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-5xl font-bold text-primary-500">
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
            ))}
          </div>
        )}

        {/* Attract message */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-center pt-8"
        >
          <p className="text-3xl text-gray-400">
            Register on the iPad to play!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
