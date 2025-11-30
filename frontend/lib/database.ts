/**
 * Supabase Data Service
 * Handles all database operations for the dashboard
 */

import { supabase } from './supabase'

export interface Plan {
  id: string
  name: string
  credits: number
  price: number
  features: string[]
  created_at: string
}

export interface UserProfile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  plan_id: string // References plans table
  credits: number
  total_designs: number
  total_exports: number
  created_at: string
  updated_at: string
}

export interface Design {
  id: string
  user_id: string
  name: string
  type: string
  style: string | null
  prompt: string
  image_url: string
  thumbnail_url: string | null
  folder: string | null
  favorite: boolean
  width: number | null
  height: number | null
  format: string | null
  model_used: string | null
  generation_time_ms: number | null
  credits_used: number
  metadata: any
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: 'active' | 'archived' | 'completed'
  color: string
  design_count: number
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  metadata: any
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string | null
  icon: string | null
  unlocked_at: string
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  reason: string
  design_id: string | null
  balance_after: number
  created_at: string
}

export interface DashboardStats {
  totalDesigns: number
  activeProjects: number
  creditsRemaining: number
  designsThisWeek: number
  projectsInProgress: number
  creditsUsed: number
  streak: number
}

/**
 * Get all available plans
 */
export async function getPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching plans:', error)
    return []
  }
}

/**
 * Get user profile with plan details
 */
export async function getUserProfileWithPlan(userId: string): Promise<(UserProfile & { plan: Plan }) | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('id', userId)
      .single()

    if (error) throw error
    return data as any
  } catch (error) {
    console.error('Error fetching user profile with plan:', error)
    return null
  }
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Calculate user's activity streak (consecutive days)
 */
async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get all activity dates for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activities } = await supabase
      .from('activity_log')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (!activities || activities.length === 0) return 0

    // Extract unique dates
    const uniqueDates = new Set(
      activities.map(a => new Date(a.created_at).toDateString())
    )
    const sortedDates = Array.from(uniqueDates).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    )

    // Check if user was active today
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    // Streak starts from today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0 // Streak broken
    }

    // Count consecutive days
    let streak = 0
    let currentDate = new Date()

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(currentDate)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (sortedDates[i] === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return Math.min(streak, 5) // Cap at 5 stars
  } catch (error) {
    console.error('Error calculating streak:', error)
    return 0
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Get total designs count
    const { count: totalDesigns } = await supabase
      .from('designs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get designs created this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: designsThisWeek } = await supabase
      .from('designs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekAgo.toISOString())

    // Get active projects count
    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    // Get projects in progress (active status)
    const { count: projectsInProgress } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')

    // Get user profile for credits and stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, total_designs, total_exports, plan_id, plans(credits)')
      .eq('id', userId)
      .single()

    const creditsRemaining = profile?.credits || 0
    const planMaxCredits = (profile?.plans as any)?.credits || 100
    const creditsUsed = planMaxCredits - creditsRemaining

    // Calculate streak from recent activity
    const streak = await calculateStreak(userId)

    return {
      totalDesigns: totalDesigns || 0,
      activeProjects: activeProjects || 0,
      creditsRemaining,
      designsThisWeek: designsThisWeek || 0,
      projectsInProgress: projectsInProgress || 0,
      creditsUsed,
      streak,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalDesigns: 0,
      activeProjects: 0,
      creditsRemaining: 100,
      designsThisWeek: 0,
      projectsInProgress: 0,
      creditsUsed: 0,
      streak: 0,
    }
  }
}

/**
 * Get recent designs
 */
export async function getRecentDesigns(userId: string, limit: number = 6): Promise<Design[]> {
  try {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recent designs:', error)
    return []
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(userId: string, limit: number = 5): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

/**
 * Log an activity
 */
export async function logActivity(
  action: string,
  entityType: string,
  entityId: string | null,
  entityName: string | null
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('activity_log').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error logging activity:', error)
    return false
  }
}

/**
 * Get user's credit transactions
 */
export async function getCreditTransactions(userId: string, limit: number = 10): Promise<CreditTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching credit transactions:', error)
    return []
  }
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return []
  }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: string, requiredCredits: number = 1): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (error) throw error
    return (data?.credits || 0) >= requiredCredits
  } catch (error) {
    console.error('Error checking credits:', error)
    return false
  }
}

/**
 * Create a new design
 */
export async function createDesign(design: Partial<Design>): Promise<Design | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('designs')
      .insert({
        ...design,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Activity is already logged by database trigger, no need to log again

    return data
  } catch (error) {
    console.error('Error creating design:', error)
    return null
  }
}

/**
 * Update a design
 */
export async function updateDesign(designId: string, updates: Partial<Design>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('designs')
      .update(updates)
      .eq('id', designId)

    if (error) throw error

    // Log activity
    if (updates.name) {
      await logActivity('edited', 'design', designId, updates.name)
    }

    return true
  } catch (error) {
    console.error('Error updating design:', error)
    return false
  }
}

/**
 * Delete a design
 */
export async function deleteDesign(designId: string, designName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('id', designId)

    if (error) throw error

    // Log activity
    await logActivity('deleted', 'design', designId, designName)

    return true
  } catch (error) {
    console.error('Error deleting design:', error)
    return false
  }
}

/**
 * Toggle design favorite status
 */
export async function toggleFavorite(designId: string, currentStatus: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('designs')
      .update({ favorite: !currentStatus })
      .eq('id', designId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return false
  }
}

/**
 * Process payment and upgrade user plan
 * Call this after successful payment (Stripe, PayPal, etc.)
 */
export async function processPaymentAndUpgrade(
  userId: string,
  planId: 'pro' | 'enterprise' | 'admin',
  paymentDetails: {
    paymentMethod: string // 'stripe', 'paypal', etc.
    transactionId: string
    amount: number
  }
): Promise<{
  success: boolean
  message: string
  data?: any
}> {
  try {
    const { data, error } = await supabase.rpc('handle_payment_success', {
      p_user_id: userId,
      p_new_plan_id: planId,
      p_payment_method: paymentDetails.paymentMethod,
      p_transaction_id: paymentDetails.transactionId,
      p_amount: paymentDetails.amount,
    })

    if (error) throw error

    return {
      success: true,
      message: `Successfully upgraded to ${planId} plan!`,
      data,
    }
  } catch (error: any) {
    console.error('Error processing payment upgrade:', error)
    return {
      success: false,
      message: error.message || 'Failed to upgrade plan',
    }
  }
}

/**
 * Change user plan (admin function)
 * Use this for manual plan changes without payment
 */
export async function changeUserPlan(
  userId: string,
  planId: 'free' | 'pro' | 'enterprise' | 'admin'
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('change_user_plan', {
      p_user_id: userId,
      p_new_plan_id: planId,
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error changing user plan:', error)
    return false
  }
}

/**
 * Add credits to user account (admin function)
 */
export async function addCreditsToUser(
  userId: string,
  amount: number,
  reason: string = 'manual_adjustment'
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding credits:', error)
    return false
  }
}

/**
 * Clean up expired designs based on plan
 * Should be run as a scheduled job (daily cron)
 */
export async function cleanupExpiredDesigns(): Promise<{
  deleted: number
  errors: number
}> {
  try {
    const now = new Date().toISOString()

    // Get all designs with expiry date in metadata that have expired
    const { data: expiredDesigns, error } = await supabase
      .from('designs')
      .select('id, name, image_url, user_id')
      .lt('metadata->expiryDate', now)

    if (error) throw error

    let deleted = 0
    let errors = 0

    for (const design of expiredDesigns || []) {
      try {
        // Delete from storage first
        const urlParts = design.image_url.split('/designs/')
        if (urlParts[1]) {
          const filePath = urlParts[1]
          await supabase.storage.from('designs').remove([filePath])
        }

        // Delete from database
        await deleteDesign(design.id, design.name)
        deleted++
      } catch (err) {
        console.error(`Failed to delete design ${design.id}:`, err)
        errors++
      }
    }

    return { deleted, errors }
  } catch (error) {
    console.error('Error cleaning up expired designs:', error)
    return { deleted: 0, errors: 0 }
  }
}

