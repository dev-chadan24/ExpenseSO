import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative text-center max-w-lg"
      >
        {/* Big 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mb-6"
        >
          <span className="text-[120px] md:text-[160px] font-extrabold leading-none font-display"
            style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center mb-6"
        >
          <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20">
            <Compass className="w-10 h-10 text-primary-400" />
          </div>
        </motion.div>

        <h1 className="text-2xl font-bold text-white font-display mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
