'use client'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserPreferences {
    theme: 'light' | 'dark' | 'system'
    language: string
    email_notifications: boolean
    push_notifications: boolean
    design_reminders: boolean
    weekly_digest: boolean
    auto_save: boolean
    grid_view: boolean
    show_tutorials: boolean
}

export default function PreferencesPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'dark',
        language: 'en',
        email_notifications: true,
        push_notifications: true,
        design_reminders: true,
        weekly_digest: true,
        auto_save: true,
        grid_view: true,
        show_tutorials: true,
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (loading) return // Wait for auth to load

        if (!user) {
            router.push('/auth/login')
            return
        }
        loadPreferences()
    }, [user])

    const loadPreferences = async () => {
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user?.id)
                .single()

            if (data) {
                setPreferences(data.preferences)
            }
        } catch (error) {
            console.error('Error loading preferences:', error)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user?.id,
                    preferences,
                    updated_at: new Date().toISOString(),
                })

            if (error) throw error

            // Show success feedback
            alert('Preferences saved successfully!')
        } catch (error) {
            console.error('Error saving preferences:', error)
            alert('Failed to save preferences')
        } finally {
            setIsSaving(false)
        }
    }

    const togglePreference = (key: keyof UserPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/media/logo.png" alt="Pixoa" className="h-10 w-10" />
                            <h1 className="text-2xl font-bold text-white">Preferences</h1>
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
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    {/* Appearance */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Appearance</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Theme
                                </label>
                                <select
                                    value={preferences.theme}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as any }))}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Language
                                </label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-white/10 mb-8" />

                    {/* Notifications */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Email Notifications</p>
                                    <p className="text-sm text-gray-400">Receive updates via email</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('email_notifications')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.email_notifications ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Push Notifications</p>
                                    <p className="text-sm text-gray-400">Browser push notifications</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('push_notifications')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.push_notifications ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Design Reminders</p>
                                    <p className="text-sm text-gray-400">Get reminded to create designs</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('design_reminders')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.design_reminders ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.design_reminders ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Weekly Digest</p>
                                    <p className="text-sm text-gray-400">Weekly summary of your activity</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('weekly_digest')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.weekly_digest ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.weekly_digest ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr className="border-white/10 mb-8" />

                    {/* Editor */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Editor Settings</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Auto-Save</p>
                                    <p className="text-sm text-gray-400">Automatically save your designs</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('auto_save')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.auto_save ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.auto_save ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Grid View Default</p>
                                    <p className="text-sm text-gray-400">Show designs in grid view by default</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('grid_view')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.grid_view ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.grid_view ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Show Tutorials</p>
                                    <p className="text-sm text-gray-400">Display helpful tooltips and guides</p>
                                </div>
                                <button
                                    onClick={() => togglePreference('show_tutorials')}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.show_tutorials ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.show_tutorials ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
