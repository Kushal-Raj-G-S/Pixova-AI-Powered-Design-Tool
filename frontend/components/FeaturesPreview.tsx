'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  BoltIcon,
  SwatchIcon,
  CloudArrowDownIcon,
  PaintBrushIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'AI-Powered Generation',
    description: 'Advanced AI models create professional designs from simple text prompts.',
    icon: CpuChipIcon,
    color: 'from-primary-500 to-primary-600',
  },
  {
    name: 'Lightning Fast',
    description: 'Generate multiple design variations in under 10 seconds.',
    icon: BoltIcon,
    color: 'from-accent-500 to-accent-600',
  },
  {
    name: 'Multiple Styles',
    description: 'Choose from modern, minimal, corporate, and many more design styles.',
    icon: SwatchIcon,
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    name: 'Smart Editor',
    description: 'Fine-tune your designs with our intuitive editor tools.',
    icon: PaintBrushIcon,
    color: 'from-primary-500 to-secondary-500',
  },
  {
    name: 'Multi-Format Export',
    description: 'Download in PNG, SVG, PDF, JPG formats for any use case.',
    icon: CloudArrowDownIcon,
    color: 'from-accent-500 to-primary-600',
  },
  {
    name: 'Magic Variations',
    description: 'Get 3-5 unique design variations with each generation.',
    icon: SparklesIcon,
    color: 'from-accent-600 to-secondary-500',
  },
]

export default function FeaturesPreview() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Why Choose Pixoa
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Everything you need to create{' '}
            <span className="gradient-text">amazing designs</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our AI-powered platform combines cutting-edge technology with intuitive design tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-6xl"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="card p-6 h-full hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} shadow-lg`}>
                      <feature.icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link 
            href="/features" 
            className="inline-flex items-center justify-center btn-primary text-lg px-8 py-4"
          >
            Explore All Features
            <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}