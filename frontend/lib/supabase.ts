import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload image from URL to Supabase Storage with organized folder structure
 * Structure: user-email/prompt_folder/image.png
 * 
 * @param imageUrl - Temporary AI-generated image URL
 * @param userEmail - User's email address
 * @param userId - User's UUID (for metadata)
 * @param prompt - The generation prompt (first 5-6 words used for folder)
 * @param fileName - Image filename
 * @param planId - User's plan for auto-deletion metadata
 * @returns Permanent public URL
 */
export async function uploadImageFromUrl(
    imageUrl: string,
    userEmail: string,
    userId: string,
    prompt: string,
    fileName: string,
    planId: string = 'free'
): Promise<string> {
    try {
        // Fetch the image
        const response = await fetch(imageUrl)
        const blob = await response.blob()

        // Create folder name from first 5-6 words of prompt
        const promptFolder = prompt
            .split(' ')
            .slice(0, 6)
            .join('_')
            .replace(/[^a-zA-Z0-9_]/g, '')
            .toLowerCase()
            .substring(0, 50) // Max 50 chars

        // Sanitize email for folder name (replace @ and . with _)
        const sanitizedEmail = userEmail.replace(/[@.]/g, '_').toLowerCase()

        // Generate unique path: user-email/prompt_folder/timestamp_filename.png
        const timestamp = Date.now()
        const filePath = `${sanitizedEmail}/${promptFolder}/${timestamp}_${fileName}.png`

        // Calculate expiry based on plan (for future cleanup job)
        const expiryDays = {
            'free': 5,
            'pro': 10,
            'enterprise': 15,
            'admin': 20
        }[planId] || 5

        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + expiryDays)

        // Upload to Supabase Storage with metadata
        const { data, error } = await supabase.storage
            .from('designs')
            .upload(filePath, blob, {
                contentType: 'image/png',
                upsert: false,
                cacheControl: '3600',
                metadata: {
                    userId,
                    userEmail,
                    planId,
                    promptFolder,
                    expiryDate: expiryDate.toISOString(),
                    uploadedAt: new Date().toISOString()
                }
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('designs')
            .getPublicUrl(data.path)

        return publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        throw error
    }
}
