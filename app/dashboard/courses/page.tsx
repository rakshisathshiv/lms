'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import Link as NextLink from 'next/link'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  rating: number
  total_reviews: number
  instructor: { id: string; full_name: string }
}

interface Enrollment {
  id: string
  course_id: string
  created_at: string
  courses: Course
}

export default function EnrolledCoursesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await fetch('/api/enrollments')
        const data = await res.json()
        setEnrollments(data.enrollments || [])
      } catch (error) {
        console.error('Error fetching enrollments:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchEnrollments()
    }
  }, [user])

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

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="mt-2 text-muted-foreground">
              Showing {enrollments.length} enrolled course{enrollments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild>
            <Link href="/courses">Browse More Courses</Link>
          </Button>
        </div>

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card
                key={enrollment.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40 bg-muted overflow-hidden">
                  {enrollment.courses.thumbnail_url ? (
                    <Image
                      src={enrollment.courses.thumbnail_url}
                      alt={enrollment.courses.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2">
                    {enrollment.courses.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {enrollment.courses.instructor.full_name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {enrollment.courses.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-yellow-500">
                      <span className="font-semibold">{enrollment.courses.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({enrollment.courses.total_reviews})</span>
                    </div>
                    <span className="text-primary font-bold">
                      ${enrollment.courses.price.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    asChild
                    className="w-full"
                    variant="default"
                  >
                    <NextLink href={`/courses/${enrollment.course_id}`}>
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </NextLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No Courses Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven't enrolled in any courses. Explore our course catalog to get started.
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
