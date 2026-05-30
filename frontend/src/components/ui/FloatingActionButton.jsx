import React from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FloatingActionButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-primary-600 to-accent-purple text-white shadow-glow-md hover:shadow-glow-lg border border-white/10 flex items-center justify-center cursor-pointer md:bottom-8 md:right-8"
      title="Add Transaction"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  )
}
