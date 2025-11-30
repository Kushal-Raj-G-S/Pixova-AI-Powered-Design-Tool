'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '/auth/signup',
    priceMonthly: '$0',
    priceYearly: '$0',
    description: 'Perfect for trying out Pixoa and creating your first designs.',
    features: [
      '5 designs per month',
      'Basic AI models',
      'PNG downloads',
      'Standard resolution',
      'Email support',
    ],
    limitations: [
      'Watermarked designs',
      'Limited export formats',
      'No commercial license',
    ],
    mostPopular: false,
    buttonText: 'Start Free',
    buttonStyle: 'btn-secondary',
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/auth/signup?plan=pro',
    priceMonthly: '$19',
    priceYearly: '$15',
    description: 'Perfect for professionals and growing businesses.',
    features: [
      'Unlimited designs',
      'All AI models',
      'All export formats (PNG, SVG, PDF, JPG)',
      'High resolution exports',
      '10 style presets',
      'Advanced editor tools',
      'No watermarks',
      'Commercial license',
      'Priority support',
    ],
    limitations: [],
    mostPopular: true,
    buttonText: 'Start Pro Trial',
    buttonStyle: 'btn-primary',
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '/contact',
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
    description: 'Advanced features for teams and large organizations.',
    features: [
      'Everything in Pro',
      'Custom AI training',
      'Brand kit management',
      'Team collaboration',
      'Admin dashboard',
      'SSO integration',
      'Custom export sizes',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
    ],
    limitations: [],
    mostPopular: false,
    buttonText: 'Contact Sales',
    buttonStyle: 'btn-secondary',
  },
]

const faqs = [
  {
    question: 'Can I use designs for commercial purposes?',
    answer: 'Yes! With Pro and Enterprise plans, you get full commercial rights to all designs you create.',
  },
  {
    question: 'What happens if I exceed my design limit?',
    answer: 'On the Free plan, you\'ll need to wait until next month or upgrade to Pro for unlimited designs.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely! You can cancel your subscription at any time from your account settings.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans if you\'re not satisfied.',
  },
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Choose the perfect plan for{' '}
            <span className="gradient-text">your needs</span>
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Start free and upgrade as you grow. All plans include our core AI design features.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <div className="relative bg-gray-100 rounded-xl p-1">
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-sm transition-transform duration-200 ${
                billingCycle === 'yearly' ? 'translate-x-full' : 'translate-x-0'
              }`}
            ></div>
            <div className="relative flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Yearly
                <span className="ml-2 inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12"
        >
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`card relative ${
                tier.mostPopular
                  ? 'ring-2 ring-primary-600 shadow-2xl scale-105'
                  : ''
              }`}
            >
              {tier.mostPopular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                  <div className="rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-1 text-center text-sm font-medium text-white">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">
                    {tier.name}
                  </h3>
                  {tier.mostPopular && (
                    <SparklesIcon className="ml-2 h-5 w-5 text-primary-600" />
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly}
                  </span>
                  {tier.priceMonthly !== 'Custom' && (
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /month
                    </span>
                  )}
                </p>
                
                <a
                  href={tier.href}
                  className={`mt-8 block w-full text-center ${tier.buttonStyle} py-3`}
                >
                  {tier.buttonText}
                </a>

                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-primary-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                  {tier.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-x-3">
                      <XMarkIcon className="h-6 w-5 flex-none text-gray-400" aria-hidden="true" />
                      <span className="text-gray-400">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-32"
        >
          <div className="mx-auto max-w-4xl">
            <h3 className="text-2xl font-bold text-gray-900 text-center lg:text-3xl">
              Frequently asked questions
            </h3>
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h4>
                  <p className="mt-3 text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-32"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-16 shadow-2xl lg:px-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-secondary-600/90"></div>
            <div className="relative mx-auto max-w-4xl text-center">
              <h3 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Need a custom solution?
              </h3>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
                Contact our team to discuss enterprise features, custom integrations,
                and volume pricing for your organization.
              </p>
              <div className="mt-10">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}