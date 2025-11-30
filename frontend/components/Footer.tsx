'use client'

import Link from 'next/link'
import { SparklesIcon } from '@heroicons/react/24/solid'
import {
  TwitterIcon,
  InstagramIcon,
  LinkedInIcon,
  GitHubIcon,
} from './icons/SocialIcons'

const navigation = {
  product: [
    { name: 'Features', href: '/features' },
    { name: 'How it Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Documentation', href: '/docs' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
}

const social = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/pixoa',
    icon: TwitterIcon,
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/pixoa',
    icon: InstagramIcon,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/pixoa',
    icon: LinkedInIcon,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/pixoa',
    icon: GitHubIcon,
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/media/logo.png" 
                alt="Pixoa Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-white">Pixoa</span>
            </Link>
            <p className="text-base leading-6 text-gray-300 max-w-md">
              Transform your ideas into stunning professional designs with AI. 
              No design skills required—just describe what you want and watch the magic happen.
            </p>
            <div className="flex space-x-6">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-primary-400 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-primary-400 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-primary-400 transition-colors"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-primary-400 transition-colors"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 border-t border-gray-700 pt-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">
                Subscribe to our newsletter
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Get the latest design tips, AI updates, and feature announcements.
              </p>
            </div>
            <form className="mt-6 sm:flex sm:max-w-md lg:mt-0">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="w-full min-w-0 appearance-none rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-base text-white placeholder-gray-400 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                placeholder="Enter your email"
              />
              <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link href="/privacy" className="text-sm leading-6 text-gray-300 hover:text-primary-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm leading-6 text-gray-300 hover:text-primary-400 transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm leading-6 text-gray-300 hover:text-primary-400 transition-colors">
              Cookies
            </Link>
          </div>
          <p className="mt-8 text-sm leading-6 text-gray-400 md:order-1 md:mt-0">
            &copy; 2025 Pixoa, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}