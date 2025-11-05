import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function Loading({ size = 'md', message }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-primary-600 border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-lg"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

export function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900">
      <Loading size="lg" message={message} />
    </div>
  );
}
