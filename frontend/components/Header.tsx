'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'How it Works', href: '/how-it-works' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href !== '/' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 fixed w-full top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <img 
              src="/media/logo.png" 
              alt="Pixoa Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-bold gradient-text">Pixoa</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`text-sm font-medium leading-5 transition-colors relative ${
                isActive(item.href)
                  ? 'text-primary-600' 
                  : 'text-gray-900 hover:text-primary-600'
              }`}
            >
              {item.name}
              {isActive(item.href) && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
              )}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-3">
          <Link 
            href="/auth/login" 
            className="text-sm font-medium leading-5 text-gray-900 hover:text-primary-600 transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-4 py-1.5">
            Start Creating
          </Link>
        </div>
      </nav>
      {/* Mobile menu */}
      <div className={`lg:hidden ${mobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
              <img 
                src="/media/logo.png" 
                alt="Pixoa Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold gradient-text">Pixoa</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6 space-y-2">
                <Link
                  href="/auth/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 btn-primary text-center"
                >
                  Start Creating
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}