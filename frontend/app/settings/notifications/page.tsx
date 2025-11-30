'use client'

import { useAuth } from '@/contexts/AuthContext'
import { BellIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    created_at: string
    link?: string
}

export default function NotificationsPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [filter, setFilter] = useState<'all' | 'unread'>('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadNotifications()
    }, [user])

    const loadNotifications = async () => {
        setIsLoading(true)
        try {
            // Mock notifications for now - replace with real database query
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    title: 'Welcome to Pixoa!',
                    message: 'Your account has been created successfully. Start creating amazing designs!',
                    type: 'success',
                    read: false,
                    created_at: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Free Credits Added',
                    message: 'You received 100 free credits to get started with AI design generation.',
                    type: 'info',
                    read: false,
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                    id: '3',
                    title: 'Design Exported',
                    message: 'Your design "Product Banner" has been exported successfully.',
                    type: 'success',
                    read: true,
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    link: '/my-designs',
                },
            ]
            setNotifications(mockNotifications)
        } catch (error) {
            console.error('Error loading notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        )
        // TODO: Update in database
    }

    const markAllAsRead = async () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        )
        // TODO: Update all in database
    }

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id))
        // TODO: Delete from database
    }

    const clearAll = async () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([])
            // TODO: Delete all from database
        }
    }

    const getTypeColor = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'text-green-400 bg-green-500/10 border-green-500/50'
            case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50'
            case 'error': return 'text-red-400 bg-red-500/10 border-red-500/50'
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/50'
        }
    }

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return '✓'
            case 'warning': return '⚠'
            case 'error': return '✕'
            default: return 'ℹ'
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/media/logo.png" alt="Pixoa" className="h-10 w-10" />
                            <h1 className="text-2xl font-bold text-white">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <a
                            href="/dashboard"
                            className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'all'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === 'unread'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                Mark All Read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-400 mt-4">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
                        <BellIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No notifications</h3>
                        <p className="text-gray-400">
                            {filter === 'unread'
                                ? "You're all caught up!"
                                : "We'll notify you when something happens"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 transition-all hover:bg-white/10 ${notification.read ? 'border-white/10' : 'border-purple-500/50'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getTypeColor(notification.type)}`}>
                                        {getTypeIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-white mb-1">{notification.title}</h3>
                                                <p className="text-sm text-gray-400">{notification.message}</p>
                                                {notification.link && (
                                                    <a
                                                        href={notification.link}
                                                        className="inline-block mt-2 text-sm text-purple-400 hover:text-purple-300"
                                                    >
                                                        View Details →
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-2">{formatTime(notification.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
