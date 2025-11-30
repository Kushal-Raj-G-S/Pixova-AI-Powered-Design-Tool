'use client'

import { TrophyIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

const achievements = [
    { id: 'first_design', title: 'First Steps', description: 'Create your first design', icon: '🎨', unlocked: true },
    { id: 'designs_10', title: 'Getting Started', description: 'Create 10 designs', icon: '📊', unlocked: false },
    { id: 'streak_7', title: 'Dedicated Creator', description: '7-day activity streak', icon: '🔥', unlocked: false },
    { id: 'exports_50', title: 'Export Master', description: 'Export 50 designs', icon: '📥', unlocked: false },
    { id: 'pro_user', title: 'Pro Member', description: 'Upgrade to Pro plan', icon: '⭐', unlocked: false },
    { id: 'designs_100', title: 'Century Club', description: 'Create 100 designs', icon: '💯', unlocked: false },
    { id: 'referral_5', title: 'Community Builder', description: 'Refer 5 friends', icon: '👥', unlocked: false },
    { id: 'perfect_week', title: 'Perfect Week', description: 'Create designs 7 days in a row', icon: '📅', unlocked: false },
]

export default function AchievementsPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/media/logo.png" alt="Pixoa" className="h-10 w-10" />
                            <h1 className="text-2xl font-bold text-white">Achievements</h1>
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

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Unlocked</p>
                                <p className="text-3xl font-bold text-white">1 / 8</p>
                            </div>
                            <TrophyIcon className="w-12 h-12 text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Progress</p>
                                <p className="text-3xl font-bold text-white">12.5%</p>
                            </div>
                            <div className="flex gap-1">
                                <StarIcon className="w-6 h-6 text-yellow-400" />
                                <StarIcon className="w-6 h-6 text-gray-600" />
                                <StarIcon className="w-6 h-6 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Next Achievement</p>
                                <p className="text-lg font-bold text-white">Getting Started</p>
                            </div>
                            <div className="text-4xl">📊</div>
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`relative bg-white/5 backdrop-blur-sm border rounded-xl p-6 transition-all ${achievement.unlocked
                                    ? 'border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20'
                                    : 'border-white/10 opacity-60 hover:opacity-80'
                                }`}
                        >
                            {achievement.unlocked && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}

                            <div className="text-center">
                                <div className="text-6xl mb-4">{achievement.icon}</div>
                                <h3 className="font-bold text-white mb-2">{achievement.title}</h3>
                                <p className="text-sm text-gray-400">{achievement.description}</p>

                                {achievement.unlocked ? (
                                    <div className="mt-4 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-semibold inline-block">
                                        Unlocked!
                                    </div>
                                ) : (
                                    <div className="mt-4 px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-xs font-semibold inline-block">
                                        Locked
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
