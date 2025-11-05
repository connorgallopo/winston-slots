import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
};

export function ScoreDisplay({
  score,
  label,
  size = 'md',
  animated = true,
}: ScoreDisplayProps) {
  const formattedScore = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(score);

  const Component = animated ? motion.div : 'div';

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold">
          {label}
        </span>
      )}
      <Component
        {...(animated && {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { type: 'spring', stiffness: 200, damping: 15 },
        })}
        className={`${sizeClasses[size]} font-bold text-primary-500 tracking-tight`}
      >
        {formattedScore}
      </Component>
    </div>
  );
}

interface ReelValueDisplayProps {
  values: {
    zillow: number;
    realtor: number;
    homes: number;
    google: number;
    smartSign: number;
  };
}

export function ReelValueDisplay({ values }: ReelValueDisplayProps) {
  const reels = [
    { name: 'Zillow', value: values.zillow },
    { name: 'Realtor', value: values.realtor },
    { name: 'Homes', value: values.homes },
    { name: 'Google', value: values.google },
    { name: 'Smart Sign', value: values.smartSign },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {reels.map((reel, index) => (
        <motion.div
          key={reel.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-700 rounded-lg p-4 text-center"
        >
          <div className="text-xs text-gray-400 mb-2">{reel.name}</div>
          <div className="text-xl font-bold text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(reel.value)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
