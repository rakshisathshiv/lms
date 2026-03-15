'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const courseId = searchParams.get('course')
  const sessionId = searchParams.get('session')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const verifyPayment = async () => {
      if (!courseId) {
        setError('Invalid course ID')
        setLoading(false)
        return
      }

      try {
        // The webhook should have already created the enrollment
        // Just verify by checking enrollments
        const res = await fetch('/api/enrollments')
        const data = await res.json()

        const isEnrolled = data.enrollments?.some(
          (e: any) => e.course_id === courseId
        )

        if (!isEnrolled) {
          setError('Enrollment verification failed')
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError('Failed to verify enrollment')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [courseId])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                Thank you for your purchase
              </p>
              <p className="text-sm text-muted-foreground">
                You have been successfully enrolled in the course and can start learning right away.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href={courseId ? `/courses/${courseId}` : '/dashboard'}>
                  Go to Course
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
