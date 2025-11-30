'use client'

import { useAuth } from '@/contexts/AuthContext'
import { getUserProfileWithPlan } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfileSettingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadProfile()
    }, [user])

    const loadProfile = async () => {
        if (!user) return

        try {
            const profile = await getUserProfileWithPlan(user.id)
            if (profile) {
                setFirstName(profile.first_name || '')
                setLastName(profile.last_name || '')
                setEmail(profile.email || user.email || '')
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        setMessage('')

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error

            setMessage('Profile updated successfully!')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Error updating profile:', error)
            setMessage('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/media/logo.png" alt="Pixoa" className="h-10 w-10" />
                            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
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
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <UserCircleIcon className="w-16 h-16 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Profile Picture</h2>
                            <p className="text-sm text-gray-400 mb-3">Update your avatar (coming soon)</p>
                            <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors" disabled>
                                Upload Image
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-2">Email cannot be changed for security reasons</p>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                {message}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
