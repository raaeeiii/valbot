import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  darkMode?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = () => {
  const dotVariants = {
    initial: { y: 0, opacity: 0.3 },
    animate: { y: -6, opacity: 1 }
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const
  };

  return (
    <div className="flex justify-start mb-2">
      <div className="flex items-center space-x-3 max-w-[85%]">
        
        {/* ValBot Avatar */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-blue-500/20 border border-cyan-400/30 shadow-sm p-1">
          <img src="/logo.png" alt="ValBot" className="w-full h-full object-contain" />
        </div>
        
        {/* Typing Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-[#161026] text-slate-200 border border-purple-500/20 shadow-sm flex items-center space-x-3"
        >
          <span className="text-xs font-medium text-slate-300">
            ValBot is thinking
          </span>
          
          <div className="flex space-x-1 items-center">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{
                  ...dotTransition,
                  delay: index * 0.18
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
