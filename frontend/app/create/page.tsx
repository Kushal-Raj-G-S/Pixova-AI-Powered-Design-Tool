'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CreatePage() {
    const router = useRouter()

    useEffect(() => {
        router.push('/generate')
    }, [router])

    return null
}
