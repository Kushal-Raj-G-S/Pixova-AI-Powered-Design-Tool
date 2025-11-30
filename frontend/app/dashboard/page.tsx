
'use client'

import LoadingScreen from '@/components/LoadingScreen'
import { useAuth } from '@/contexts/AuthContext'
import {
  getDashboardStats,
  getRecentActivity,
  getRecentDesigns,
  getUserProfileWithPlan,
  type Activity,
  type DashboardStats,
  type Design,
  type Plan,
  type UserProfile,
} from '@/lib/database'
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  BoltIcon,
  ClockIcon,
  Cog6ToothIcon,
  FireIcon,
  FolderIcon,
  PhotoIcon,
  PlusIcon,
  SparklesIcon,
  TrophyIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState<{
    show: boolean
    title: string
    features: string[]
    icon: string
  }>({ show: false, title: '', features: [], icon: '' })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [userProfile, setUserProfile] = useState<(UserProfile & { plan: Plan }) | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [recentDesigns, setRecentDesigns] = useState<Design[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (user && !userProfile) {
      // Only fetch if we don't have profile data yet
      loadDashboardData()
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = async () => {
    if (!user) return

    setDataLoading(true)
    try {
      // Fetch all data in parallel
      const [stats, profile, activity, designs] = await Promise.all([
        getDashboardStats(user.id),
        getUserProfileWithPlan(user.id),
        getRecentActivity(user.id, 5),
        getRecentDesigns(user.id, 6),
      ])

      setDashboardStats(stats)
      setUserProfile(profile)
      setRecentActivity(activity)
      setRecentDesigns(designs)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Show loading only on first auth check
  if (loading && !user) {
    return <LoadingScreen message="Checking authentication..." />
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getUserName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name
    }
    return user?.email?.split('@')[0] || 'Creator'
  }

  const stats = [
    {
      name: 'Designs Created',
      value: dashboardStats?.totalDesigns.toString() || '0',
      change: `+${dashboardStats?.designsThisWeek || 0} this week`,
      icon: PhotoIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Active Projects',
      value: dashboardStats?.activeProjects.toString() || '0',
      change: `${dashboardStats?.projectsInProgress || 0} in progress`,
      icon: FolderIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'AI Credits',
      value: userProfile?.plan?.id === 'admin' ? '∞' : (userProfile?.credits?.toString() || '100'),
      change: userProfile?.plan?.id === 'admin' ? 'Unlimited' : `Max: ${userProfile?.plan?.credits || 0}`,
      icon: SparklesIcon,
      color: 'from-orange-500 to-yellow-500'
    },
  ]

  // Helper function to get activity icon and color
  const getActivityMeta = (action: string, entityType: string) => {
    const actionMap: Record<string, { icon: any; color: string }> = {
      'created': { icon: SparklesIcon, color: 'text-purple-500' },
      'edited': { icon: PhotoIcon, color: 'text-blue-500' },
      'exported': { icon: BoltIcon, color: 'text-green-500' },
      'deleted': { icon: PhotoIcon, color: 'text-red-500' },
    }
    return actionMap[action] || { icon: PhotoIcon, color: 'text-gray-500' }
  }

  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  const quickActions = [
    {
      name: 'New Design',
      description: 'Start with AI generation',
      icon: SparklesIcon,
      href: '/generate',
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-white'
    },
    {
      name: 'Browse Templates',
      description: 'Use pre-made designs',
      icon: PhotoIcon,
      href: '/templates',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-white'
    },
    {
      name: 'My Designs',
      description: 'View all your work',
      icon: FolderIcon,
      href: '/my-designs',
      color: 'from-orange-500 to-yellow-500',
      textColor: 'text-white'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowComingSoon({ show: false, title: '', features: [], icon: '' })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{showComingSoon.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">{showComingSoon.title}</h2>
                <p className="text-gray-400 text-sm">Coming Soon</p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-white font-semibold text-sm">You will be able to:</p>
                {showComingSoon.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm">{feature}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowComingSoon({ show: false, title: '', features: [], icon: '' })}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/media/logo.png"
                alt="Pixoa Logo"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-400">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Plan Badge */}
              {userProfile && (
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${userProfile.plan.id === 'admin' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                  userProfile.plan.id === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' :
                    userProfile.plan.id === 'pro' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                      'bg-gray-700 text-gray-300'
                  }`}>
                  {userProfile.plan.id === 'admin' ? '👑 Admin' :
                    userProfile.plan.id === 'enterprise' ? '⭐ Enterprise' :
                      userProfile.plan.id === 'pro' ? '🚀 Pro' :
                        '🆓 Free'}
                </div>
              )}

              {/* Notifications */}
              <button
                onClick={() => setShowComingSoon({
                  show: true,
                  title: 'Notifications',
                  icon: '🔔',
                  features: [
                    'Design generation completed',
                    'Credits running low',
                    'New features & updates',
                    'Plan expiry reminders'
                  ]
                })}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowComingSoon({
                  show: true,
                  title: 'Settings',
                  icon: '⚙️',
                  features: [
                    'Account preferences',
                    'Email notifications',
                    'API integrations',
                    'Privacy settings'
                  ]
                })}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Cog6ToothIcon className="h-6 w-6" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {getUserName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{getUserName()}</p>
                    <p className="text-xs text-gray-400">{userProfile?.plan?.name || 'Free'} Plan</p>
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{getUserName()}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            setShowComingSoon({
                              show: true,
                              title: 'Profile Settings',
                              icon: '👤',
                              features: [
                                'Display name',
                                'Avatar image',
                                'Email preferences',
                                'Account details'
                              ]
                            })
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <UserCircleIcon className="w-4 h-4" />
                          Profile Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            setShowComingSoon({
                              show: true,
                              title: 'Preferences',
                              icon: '⚙️',
                              features: [
                                'Dashboard layout',
                                'Default design quality',
                                'Auto-save settings',
                                'Keyboard shortcuts'
                              ]
                            })
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                          Preferences
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            setShowComingSoon({
                              show: true,
                              title: 'Achievements',
                              icon: '🏆',
                              features: [
                                'First Design',
                                '10 Designs Created',
                                '7-Day Streak',
                                '50 Exports',
                                'Pro User'
                              ]
                            })
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <TrophyIcon className="w-4 h-4" />
                          Achievements
                        </button>
                      </div>
                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}, {getUserName()}! 👋
            </h2>
            <p className="text-white/90">
              Ready to create something amazing today? Your creativity awaits!
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mb-24"></div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-white mb-1">{stat.name}</p>
              <p className="text-xs text-gray-400">{stat.change}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={action.name}
                    href={action.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`group relative bg-gradient-to-br ${action.color} rounded-xl p-6 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/50 transition-all cursor-pointer`}
                  >
                    <div className="relative z-10">
                      <action.icon className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-white mb-1">{action.name}</h4>
                      <p className="text-sm text-white/80">{action.description}</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform"></div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Recent Designs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Recent Designs</h3>
                <a href="/my-designs" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  View All →
                </a>
              </div>

              {/* Empty State with Style */}
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Start Your Creative Journey
                </h4>
                <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                  Your designs will appear here. Create your first AI-powered design now!
                </p>
                <a
                  href="/generate"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Your First Design
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Activity & Tips */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const meta = getActivityMeta(activity.action, activity.entity_type)
                  const ActivityIcon = meta.icon
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-2 bg-white/10 rounded-lg ${meta.color}`}>
                        <ActivityIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-400">{activity.entity_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Recent Designs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5" />
                  Recent Designs
                </h3>
                <a href="/my-designs" className="text-sm text-purple-400 hover:text-purple-300">
                  View All
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recentDesigns.length > 0 ? (
                  recentDesigns.map((design) => (
                    <a
                      key={design.id}
                      href={`/editor?id=${design.id}`}
                      className="group relative aspect-video rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {design.thumbnail_url ? (
                        <img
                          src={design.thumbnail_url}
                          alt={design.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-xs text-white font-medium truncate">{design.name}</p>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6">
                    <PhotoIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No designs yet</p>
                    <a href="/generate" className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
                      Create your first design
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pro Tip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <FireIcon className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Pro Tip</h3>
              </div>
              <p className="text-sm text-gray-300">
                Try using detailed prompts for better AI results! Include style, colors, and mood in your descriptions.
              </p>
            </motion.div>

            {/* Achievement Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rising Star</h3>
              <p className="text-sm text-gray-400 mb-3">
                You're on a {dashboardStats?.streak || 0}-day streak! 🔥
              </p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-5 h-5 ${star <= (dashboardStats?.streak || 0) ? 'text-yellow-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
