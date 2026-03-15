'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Course {
  id: string
  title: string
  price: number
  thumbnail_url: string
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`)
        const data = await res.json()
        setCourse(data.course)
      } catch (err) {
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const handleCheckout = async () => {
    setProcessing(true)
    setError('')

    try {
      const res = await fetch('/api/payments/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json()

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      setError('An error occurred during checkout')
      console.error('Checkout error:', err)
    } finally {
      setProcessing(false)
    }
  }

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

  if (!course) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Course not found</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <Button asChild variant="outline" className="mb-6">
          <Link href={`/courses/${courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Course Summary */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold text-foreground mb-2">Course</h3>
                  <p className="text-foreground">{course.title}</p>
                </div>

                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold text-foreground mb-2">Student</h3>
                  <p className="text-foreground">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${course.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-xl text-primary">${course.price.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/courses/${courseId}`}>Cancel</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
