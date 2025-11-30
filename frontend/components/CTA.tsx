'use client'

import { motion } from 'framer-motion'
import { SparklesIcon, BoltIcon, SwatchIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Instant Generation',
    description: 'Get professional designs in under 10 seconds',
    icon: BoltIcon,
  },
  {
    name: 'AI-Powered',
    description: 'Advanced machine learning for stunning results',
    icon: SparklesIcon,
  },
  {
    name: 'Multiple Styles',
    description: 'Choose from 10+ design styles and presets',
    icon: SwatchIcon,
  },
]

export default function CTA() {
  return (
    <section className="section-padding bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to transform your{' '}
            <span className="text-accent-200">design workflow?</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of creators who've revolutionized their design process with Pixoa. 
            Start creating professional designs in seconds, not hours.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {feature.name}
              </h3>
              <p className="mt-2 text-white/80">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row"
        >
          <a
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            Start Creating for Free
          </a>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all duration-200"
          >
            View Pricing
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-center gap-4 text-white/70"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="flex items-center">
              <svg className="mr-2 h-4 w-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center">
              <svg className="mr-2 h-4 w-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              5 free designs included
            </span>
            <span className="flex items-center">
              <svg className="mr-2 h-4 w-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Start creating in 30 seconds
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 border-t border-white/20 pt-16"
        >
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            <div>
              <div className="text-3xl font-bold text-white lg:text-4xl">2M+</div>
              <div className="mt-2 text-sm text-white/70">Designs Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white lg:text-4xl">50K+</div>
              <div className="mt-2 text-sm text-white/70">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white lg:text-4xl">98%</div>
              <div className="mt-2 text-sm text-white/70">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white lg:text-4xl">10sec</div>
              <div className="mt-2 text-sm text-white/70">Average Generation</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}