import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenTransitionProps {
  children: ReactNode;
  transitionKey: string;
}

export function ScreenTransition({ children, transitionKey }: ScreenTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
