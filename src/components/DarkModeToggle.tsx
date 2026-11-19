import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-400 dark:hover:text-gray-200"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      animate={{ rotate: isDark ? 360 : 0 }}
      transition={{ duration: 0.3 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </motion.button>
  )
}
