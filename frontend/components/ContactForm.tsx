'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline'

const contactMethods = [
  {
    name: 'Email Support',
    description: 'Get help from our support team',
    icon: EnvelopeIcon,
    contact: 'support@pixoa.com',
    href: 'mailto:support@pixoa.com',
  },
  {
    name: 'Live Chat',
    description: 'Chat with us in real-time',
    icon: ChatBubbleLeftRightIcon,
    contact: 'Start Chat',
    href: '#',
  },
  {
    name: 'Phone',
    description: 'Call us during business hours',
    icon: PhoneIcon,
    contact: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    name: 'Office',
    description: 'Visit our headquarters',
    icon: MapPinIcon,
    contact: 'San Francisco, CA',
    href: '#',
  },
]

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center mb-16"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Get in touch with{' '}
            <span className="gradient-text">our team</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Have questions about Pixoa? Need help getting started? Our team is here to help you 
            create amazing designs with AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="enterprise">Enterprise Sales</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Press & Media</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-lg"
                >
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Other ways to reach us
              </h2>
              <p className="text-gray-600 mb-8">
                Choose the method that works best for you. Our team is available 
                Monday to Friday, 9 AM to 6 PM PST.
              </p>
            </div>

            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.name}
                  href={method.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="block p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg group-hover:scale-110 transition-transform">
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {method.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {method.description}
                      </p>
                      <p className="text-primary-600 font-medium">
                        {method.contact}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Response Time Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💬 Quick Response Times
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Live Chat: Instant response</p>
                <p>• Email Support: 2-4 hours</p>
                <p>• Phone: Available 9 AM - 6 PM PST</p>
                <p>• Enterprise: Dedicated account manager</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}