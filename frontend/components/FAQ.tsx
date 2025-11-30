'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    question: 'How does Pixoa\'s AI design generation work?',
    answer: 'Pixoa uses advanced machine learning models trained on millions of design examples. When you enter a text prompt, our AI analyzes your request and generates multiple unique design variations based on current design trends, color theory, and composition principles.',
  },
  {
    question: 'Can I use Pixoa designs for commercial purposes?',
    answer: 'Yes! With Pro and Enterprise plans, you receive full commercial rights to all designs you create. This includes using them for business logos, marketing materials, products, and any commercial applications. Free plan designs come with some restrictions.',
  },
  {
    question: 'What file formats can I export my designs in?',
    answer: 'Pixoa supports multiple export formats including PNG (for web), SVG (scalable vector), PDF (print-ready), and JPG. Pro users get access to all formats and can export in various resolutions optimized for different use cases.',
  },
  {
    question: 'How many designs can I create with each plan?',
    answer: 'Free plan includes 5 designs per month. Pro plan offers unlimited design generation. All plans allow you to generate multiple variations with each prompt, giving you more options to choose from.',
  },
  {
    question: 'Can I edit the AI-generated designs?',
    answer: 'Absolutely! Pixoa includes a built-in editor that lets you customize colors, text, layout, and other design elements. You can fine-tune any generated design to perfectly match your vision or brand requirements.',
  },
  {
    question: 'What design styles are available?',
    answer: 'Pixoa offers 10+ style presets including Modern, Minimal, Corporate, Playful, Retro, Elegant, and more. Each style influences the AI to create designs with specific aesthetic characteristics, fonts, and color palettes.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! You can start with our Free plan which includes 5 design generations per month. No credit card required. You can upgrade to Pro anytime to unlock unlimited designs and advanced features.',
  },
  {
    question: 'How long does it take to generate a design?',
    answer: 'Most designs are generated in under 10 seconds. Complex requests might take up to 30 seconds. Our AI works in real-time to provide you with multiple variations quickly so you can iterate and refine your ideas.',
  },
  {
    question: 'Can I collaborate with my team on Pixoa?',
    answer: 'Team collaboration features are available with our Enterprise plan. This includes shared workspaces, design libraries, brand kit management, and admin controls for managing team access and permissions.',
  },
  {
    question: 'What if I\'m not satisfied with my subscription?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not completely satisfied with Pixoa, contact our support team within 30 days of your purchase for a full refund.',
  },
]

interface FAQItemProps {
  faq: {
    question: string
    answer: string
  }
  index: number
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ faq, index, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border-b border-gray-200"
    >
      <button
        className="flex w-full items-center justify-between py-6 text-left"
        onClick={onToggle}
      >
        <span className="text-lg font-semibold text-gray-900 pr-6">
          {faq.question}
        </span>
        <ChevronDownIcon
          className={`h-6 w-6 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-600 leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            FAQ
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Frequently asked{' '}
            <span className="gradient-text">questions</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Everything you need to know about Pixoa. Can't find what you're looking for?{' '}
            <a href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
              Contact our support team
            </a>
            .
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-32"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
            <div className="px-8 py-16 text-center lg:px-16">
              <h3 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Still have questions?
              </h3>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                Our friendly support team is here to help. Get in touch and we'll
                get back to you as soon as possible.
              </p>
              
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                <a href="/contact" className="btn-primary text-lg px-8 py-4">
                  Contact Support
                </a>
                <a href="mailto:help@pixoa.com" className="btn-secondary text-lg px-8 py-4">
                  Email Us
                </a>
              </div>

              <div className="mt-8 text-sm text-gray-500">
                <p>Average response time: 2 hours</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}