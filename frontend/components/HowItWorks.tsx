'use client'

import { motion } from 'framer-motion'
import {
  PencilIcon,
  CpuChipIcon,
  SwatchIcon,
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline'

const steps = [
  {
    id: 1,
    name: 'Describe Your Vision',
    description: 'Simply type what you want to create. Be as detailed or simple as you like.',
    icon: PencilIcon,
    example: '"Modern logo for a tech startup with blue colors"',
    color: 'from-primary-500 to-primary-600',
  },
  {
    id: 2,
    name: 'AI Magic Happens',
    description: 'Our advanced AI models process your request and generate multiple design variations.',
    icon: CpuChipIcon,
    example: 'AI analyzes trends, colors, and styles',
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    id: 3,
    name: 'Customize & Refine',
    description: 'Choose your favorite design and make adjustments with our intuitive editor.',
    icon: SwatchIcon,
    example: 'Change colors, fonts, layout, and text',
    color: 'from-accent-500 to-accent-600',
  },
  {
    id: 4,
    name: 'Download & Use',
    description: 'Export in multiple formats (PNG, SVG, PDF) and use them anywhere you need.',
    icon: CloudArrowDownIcon,
    example: 'High-quality files ready for web or print',
    color: 'from-primary-600 to-accent-500',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const stepVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding gradient-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            From idea to design in{' '}
            <span className="gradient-text">4 simple steps</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Creating professional designs has never been easier. Just follow these simple steps
            and watch your ideas come to life in seconds.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24"
        >
          <div className="space-y-12 lg:space-y-20">
            {steps.map((step, stepIdx) => (
              <motion.div
                key={step.id}
                variants={stepVariants}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  stepIdx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${step.color} shadow-lg`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border-2 border-gray-100">
                      <span className="text-lg font-bold text-gray-900">{step.id}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                      {step.name}
                    </h3>
                    <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="mt-4 p-4 bg-white/50 rounded-xl border border-white/20 backdrop-blur-sm">
                      <p className="text-sm text-gray-500 font-medium">Example:</p>
                      <p className="text-sm text-gray-700 italic">{step.example}</p>
                    </div>
                  </div>
                </div>

                {/* Visual */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="aspect-square bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-6">
                      {/* Step 1: Text Input */}
                      {step.id === 1 && (
                        <div className="h-full flex flex-col justify-center space-y-4">
                          <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                            <div className="flex items-center space-x-2 mb-3">
                              <PencilIcon className="h-5 w-5 text-primary-500" />
                              <span className="text-sm font-medium text-gray-700">Describe your vision</span>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-primary-100 rounded animate-pulse"></div>
                              <div className="h-3 bg-primary-100 rounded w-3/4 animate-pulse"></div>
                              <div className="h-3 bg-primary-100 rounded w-1/2 animate-pulse"></div>
                            </div>
                            <div className="mt-4 text-xs text-gray-500 italic">
                              "Modern logo for a tech startup with blue colors"
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: AI Processing */}
                      {step.id === 2 && (
                        <div className="h-full flex flex-col justify-center items-center space-y-6">
                          <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center animate-pulse">
                              <CpuChipIcon className="h-10 w-10 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-400 rounded-full animate-bounce"></div>
                          </div>
                          <div className="text-center">
                            <div className="flex justify-center space-x-1 mb-2">
                              {[...Array(3)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                ></div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-600">AI analyzing trends, colors, and styles</p>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Customization */}
                      {step.id === 3 && (
                        <div className="h-full flex flex-col justify-center space-y-4">
                          <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg"></div>
                              <div className="aspect-square bg-gradient-to-br from-green-400 to-green-500 rounded-lg ring-2 ring-accent-400"></div>
                              <div className="aspect-square bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg"></div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600">Font</span>
                              <SwatchIcon className="h-4 w-4 text-accent-500" />
                            </div>
                            <div className="space-y-1">
                              <div className="h-2 bg-accent-200 rounded"></div>
                              <div className="h-2 bg-accent-200 rounded w-2/3"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Download */}
                      {step.id === 4 && (
                        <div className="h-full flex flex-col justify-center space-y-4">
                          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-medium text-gray-700">Export Ready</span>
                              <CloudArrowDownIcon className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border">
                                <span className="text-xs text-gray-600">logo.png</span>
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white">✓</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border">
                                <span className="text-xs text-gray-600">logo.svg</span>
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white">✓</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border">
                                <span className="text-xs text-gray-600">logo.pdf</span>
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white">✓</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Connection line to next step */}
                    {stepIdx < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="w-px h-20 bg-gradient-to-b from-gray-300 to-transparent"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-32"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">
            <div className="p-8 lg:p-16">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                  See it in action
                </h3>
                <p className="mt-4 text-lg text-gray-600">
                  Watch how Pixoa transforms a simple prompt into stunning designs
                </p>
              </div>
              
              <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Input */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <PencilIcon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-gray-900">Your Prompt</h4>
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700 italic">
                      "Create a Majestic White-Tiger-Confronting-Crocodile-in-Natural-Habitat"
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <div className="h-px w-full bg-gradient-to-r from-primary-500 to-secondary-500 lg:hidden"></div>
                  <div className="hidden lg:block text-3xl text-gray-400">→</div>
                </div>

                {/* Output */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <SwatchIcon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-gray-900">AI-Generated Designs</h4>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img 
                        src="/media/tiger 1.png" 
                        alt="AI Generated Tiger Design 1" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img 
                        src="/media/tiger 2.png" 
                        alt="AI Generated Tiger Design 2" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img 
                        src="/media/tiger 3.png" 
                        alt="AI Generated Tiger Design 3" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img 
                        src="/media/tiger 4.png" 
                        alt="AI Generated Tiger Design 4" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">✨ Generated in under 10 seconds</p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <a href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                  Try It Now - Free
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}