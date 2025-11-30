'use client'

import { motion } from 'framer-motion'
import {
  SparklesIcon,
  BoltIcon,
  SwatchIcon,
  CloudArrowDownIcon,
  PaintBrushIcon,
  CpuChipIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'AI-Powered Generation',
    description: 'Advanced AI models create professional designs from simple text prompts in seconds.',
    icon: CpuChipIcon,
    color: 'from-primary-500 to-primary-600',
  },
  {
    name: 'Lightning Fast',
    description: 'Generate multiple design variations in under 10 seconds. No waiting, no delays.',
    icon: BoltIcon,
    color: 'from-accent-500 to-accent-600',
  },
  {
    name: 'Multiple Style Presets',
    description: 'Choose from modern, minimal, corporate, playful, and many more design styles.',
    icon: SwatchIcon,
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    name: 'Smart Editor',
    description: 'Fine-tune your designs with our intuitive editor. Change colors, text, and layouts easily.',
    icon: PaintBrushIcon,
    color: 'from-primary-500 to-secondary-500',
  },
  {
    name: 'Multi-Format Export',
    description: 'Download in PNG, SVG, JPG, PDF formats. Perfect for web, print, and social media.',
    icon: CloudArrowDownIcon,
    color: 'from-accent-500 to-primary-600',
  },
  {
    name: 'Brand Consistency',
    description: 'Maintain consistent branding across all your designs with custom color palettes.',
    icon: DocumentDuplicateIcon,
    color: 'from-secondary-500 to-accent-600',
  },
  {
    name: 'Commercial License',
    description: 'Use your designs for commercial purposes. Full ownership and copyright included.',
    icon: ShieldCheckIcon,
    color: 'from-primary-600 to-accent-500',
  },
  {
    name: 'Magic Variations',
    description: 'Get 3-5 unique design variations with each generation. More options, better results.',
    icon: SparklesIcon,
    color: 'from-accent-600 to-secondary-500',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export default function Features() {
  return (
    <section id="features" className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Powerful Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Everything you need to create{' '}
            <span className="gradient-text">amazing designs</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our AI-powered platform combines cutting-edge technology with intuitive design tools
            to help you create professional graphics without any design experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24"
        >
          <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 xl:gap-x-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={itemVariants}
                className="group relative"
              >
                <div className="card p-8 h-full hover:scale-105 transition-transform duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold leading-8 text-gray-900">
                        {feature.name}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-32"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-8 py-16 shadow-2xl lg:px-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"></div>
            <div className="relative mx-auto max-w-4xl text-center">
              <h3 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Ready to create your first design?
              </h3>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
                Join thousands of creators who use Pixoa to bring their ideas to life.
                Start with our free plan and upgrade as you grow.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                  Start Free Trial
                </a>
                <a href="#pricing" className="text-white font-semibold hover:text-primary-400 transition-colors">
                  View Pricing <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-primary-500/20 blur-xl"></div>
            <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-secondary-500/20 blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/10 blur-2xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}