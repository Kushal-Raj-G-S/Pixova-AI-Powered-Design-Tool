'use client'

import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = "Creating magic..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <img 
              src="/media/logo.png" 
              alt="Pixoa" 
              className="h-20 w-20 mx-auto"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-xl opacity-50"
            />
          </div>
        </motion.div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
                className="w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity
              }}
              className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500"
            />
          </div>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold gradient-text mb-2">Pixoa</h2>
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-gray-600"
          >
            {message}
          </motion.p>
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-30"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}