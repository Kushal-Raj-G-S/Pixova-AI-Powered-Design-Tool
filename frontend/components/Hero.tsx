'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  BoltIcon, 
  PaintBrushIcon,
  PhotoIcon,
  DocumentTextIcon,
  SwatchIcon
} from '@heroicons/react/24/outline'

const designTypes = [
  { name: 'Logos', icon: SparklesIcon, color: 'text-primary-500' },
  { name: 'Web Designs', icon: DocumentTextIcon, color: 'text-secondary-500' },
  { name: 'Social Media', icon: PhotoIcon, color: 'text-accent-500' },
  { name: 'Brand Assets', icon: SwatchIcon, color: 'text-primary-500' },
  { name: 'Illustrations', icon: PaintBrushIcon, color: 'text-secondary-500' },
  { name: 'Marketing', icon: BoltIcon, color: 'text-accent-500' },
]

const stats = [
  { label: 'Designs Created', value: '2M+' },
  { label: 'Happy Users', value: '50K+' },
  { label: 'AI Models', value: '12+' },
  { label: 'Export Formats', value: '8+' },
]

export default function Hero() {
  const [currentPrompt, setCurrentPrompt] = useState("Professional logo for a modern tech startup")

  const demoPrompts = [
    "Professional logo for a modern tech startup",
    "Minimalist business card design",
    "Instagram post for a coffee shop",
    "Website banner for an eco-friendly brand",
    "Colorful flyer for a music festival"
  ]

  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-24">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-bg opacity-50"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Create Stunning Designs with{' '}
              <span className="gradient-text font-display">AI Magic</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl"
          >
            Transform your ideas into professional graphics, logos, and brand assets in seconds. 
            No design skills required—just describe what you want and watch the magic happen.
          </motion.p>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 mx-auto max-w-2xl"
          >
            <div className="relative">
              <div className="flex items-center bg-white rounded-2xl shadow-xl border border-gray-200 p-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    placeholder="Describe your design idea..."
                    className="block w-full border-0 py-4 px-6 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none text-lg"
                  />
                </div>
                <button className="btn-primary whitespace-nowrap">
                  Generate Design
                </button>
              </div>
              
              {/* Quick Prompts */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {demoPrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPrompt(prompt)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
              Start Creating Free
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
              See How it Works
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16"
          >
            <p className="text-sm font-semibold text-gray-600 mb-8">
              Trusted by creators worldwide
            </p>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Design Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20"
          >
            <p className="text-lg font-semibold text-gray-900 mb-8">
              Create any type of design
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {designTypes.map((type, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <type.icon className={`h-8 w-8 ${type.color} mb-2`} />
                  <span className="text-sm font-medium text-gray-900">{type.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Demo Gallery Preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="relative mt-20 mx-auto max-w-7xl px-6 lg:px-8"
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <div className="text-center">
                      <SparklesIcon className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">AI Generated Design {i}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-white text-lg font-medium">
                ✨ Generated in under 10 seconds
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// Add custom animation styles for blob animation
const styles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}