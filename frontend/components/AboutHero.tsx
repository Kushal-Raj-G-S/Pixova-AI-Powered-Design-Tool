'use client'

import { motion } from 'framer-motion'
import { SparklesIcon, UsersIcon, HeartIcon } from '@heroicons/react/24/outline'

const stats = [
  { label: 'Happy Customers', value: '50K+', icon: UsersIcon },
  { label: 'Designs Created', value: '2M+', icon: SparklesIcon },
  { label: 'Customer Satisfaction', value: '98%', icon: HeartIcon },
]

const team = [
  {
    name: 'Kushal Raj G S',
    role: 'Creator & Developer of Pixova',
    bio: 'Passionate in leveraging AI to make design accessible to everyone.',
    image: './media/kush.JPG',
  }
]

export default function AboutHero() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Democratizing design through{' '}
            <span className="gradient-text">AI innovation</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            At Pixoa, we believe everyone should have access to professional design tools. 
            Our mission is to empower creators, entrepreneurs, and businesses with AI-powered 
            design technology that makes professional graphics accessible to all.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12 lg:p-16">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                We're building the future of design where creativity meets artificial intelligence. 
                Our platform combines advanced machine learning with intuitive user experience to 
                help anyone create stunning visuals in seconds. Whether you're a startup founder, 
                marketer, or creative professional, Pixoa empowers you to bring your ideas to life 
                without the traditional barriers of design expertise or expensive software.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Meet our team
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Passionate experts dedicated to revolutionizing design through AI
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <img
                  className="mx-auto h-32 w-32 rounded-full object-cover"
                  src={member.image}
                  alt={member.name}
                />
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium">
                  {member.role}
                </p>
                <p className="mt-4 text-gray-600">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our values
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg mb-6">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Innovation First
              </h3>
              <p className="text-gray-600">
                We constantly push the boundaries of what's possible with AI and design technology.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 shadow-lg mb-6">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                User-Centric
              </h3>
              <p className="text-gray-600">
                Every feature we build is designed with our users' needs and feedback at the center.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 shadow-lg mb-6">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Accessibility
              </h3>
              <p className="text-gray-600">
                We believe great design should be accessible to everyone, regardless of skill level.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}