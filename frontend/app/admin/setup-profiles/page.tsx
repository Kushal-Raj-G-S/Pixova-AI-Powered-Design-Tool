'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SetupProfilesPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const createMissingProfiles = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Get all auth users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) {
        setError('Error fetching users: ' + usersError.message)
        setLoading(false)
        return
      }

      if (!users || users.length === 0) {
        setMessage('No users found')
        setLoading(false)
        return
      }

      let created = 0
      let skipped = 0

      for (const user of users) {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (existingProfile) {
          skipped++
          continue
        }

        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          plan: 'free',
          credits: 100,
        })

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError)
          continue
        }

        // Create achievement
        await supabase.from('achievements').insert({
          user_id: user.id,
          achievement_type: 'streak',
          value: 0,
        })

        created++
      }

      setMessage(`✅ Created ${created} profiles, skipped ${skipped} existing profiles`)
    } catch (err: any) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Setup User Profiles</h1>
        <p className="text-gray-400 mb-6">
          This will create profiles for any users who don't have one yet.
        </p>

        <button
          onClick={createMissingProfiles}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Profiles...' : 'Create Missing Profiles'}
        </button>

        {message && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="text-green-400 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
          <p className="text-yellow-400 text-xs">
            <strong>Note:</strong> This requires service role access. If you get permission errors, 
            create profiles manually in Supabase Table Editor.
          </p>
        </div>
      </div>
    </div>
  )
}
