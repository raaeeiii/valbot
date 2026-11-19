import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  darkMode?: boolean;
}

export default function TypingIndicator({ darkMode = false }: TypingIndicatorProps) {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 }
  };

  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center max-w-[85%] md:max-w-[70%]">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg flex-shrink-0">
          <span className="text-white text-lg font-medium">AI</span>
        </div>
        
        {/* Typing bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`px-6 py-4 rounded-2xl rounded-bl-md shadow-lg ${
            darkMode
              ? 'bg-gray-700/80 backdrop-blur-sm border border-gray-600/50'
              : 'bg-white/90 backdrop-blur-sm border border-gray-200/50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              ValBot is typing
            </span>
            
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    darkMode ? 'bg-blue-400' : 'bg-blue-500'
                  }`}
                  variants={dotVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    ...dotTransition,
                    delay: index * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
