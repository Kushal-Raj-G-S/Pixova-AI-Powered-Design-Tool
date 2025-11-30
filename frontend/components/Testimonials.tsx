'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'

const testimonials = [
  {
    content: 'Pixoa transformed our design workflow completely. What used to take our team days now takes minutes. The AI-generated designs are incredibly professional and on-brand.',
    rating: 5,
  },
  {
    content: 'As a non-designer, I was amazed at how quickly I could create professional logos and marketing materials. Pixoa made our brand look like we hired an expensive agency.',
    rating: 5,
  },
  {
    content: 'Even as a professional designer, I use Pixoa for rapid prototyping and client presentations. It helps me explore more creative directions in less time.',
    rating: 5,
  },
  {
    content: 'Creating product banners and social media posts has never been easier. Pixoa helps us maintain consistent branding across all our marketing channels.',
    rating: 5,
  },
  {
    content: 'I needed professional designs for my bakery but couldn\'t afford a designer. Pixoa gave me exactly what I needed at a fraction of the cost.',
    rating: 5,
  },
  {
    content: 'The variety of design styles and the speed of generation is incredible. I can create a week\'s worth of social media content in under an hour.',
    rating: 5,
  },
]

const stats = [
  { label: 'Customer Satisfaction', value: '98%' },
  { label: 'Time Saved', value: '85%' },
  { label: 'Designs Created', value: '2M+' },
  { label: 'Active Users', value: '50K+' },
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

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="section-padding gradient-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Loved by creators{' '}
            <span className="gradient-text">worldwide</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            See what our users are saying about their experience with Pixoa.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sliding Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-16 lg:mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 p-8 lg:p-16">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 lg:text-3xl mb-8">
                What our users say
              </h3>
              
              {/* Testimonial Carousel */}
              <div className="relative h-40 md:h-32 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-amber-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <blockquote className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                      "{testimonials[currentIndex].content}"
                    </blockquote>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentIndex
                        ? 'bg-primary-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 lg:mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">
            <div className="px-8 py-16 text-center lg:px-16">
              <h3 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Join the Pixoa community
              </h3>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                Thousands of creators, marketers, and business owners trust Pixoa 
                to bring their design ideas to life. Start creating today.
              </p>
              
              <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
                <a href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                  Start Creating for Free
                </a>
                <div className="flex items-center text-sm text-gray-500">
                  <span>✓ No credit card required</span>
                  <span className="mx-2">•</span>
                  <span>✓ 5 free designs</span>
                  <span className="mx-2">•</span>
                  <span>✓ Cancel anytime</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}