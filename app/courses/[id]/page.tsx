'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Users, Clock, BookOpen, ArrowLeft } from 'lucide-react'

interface Instructor {
  id: string
  full_name: string
  bio?: string
  profile_picture_url?: string
}

interface Lesson {
  id: string
  title: string
  position: number
  video_url: string
  duration: number
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  rating: number
  total_reviews: number
  category: string
  level: string
  instructor: Instructor
  lessons: Lesson[]
  lessonCount: number
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  user: { id: string; full_name: string }
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}`)
        const data = await res.json()
        setCourse(data.course)
        setReviews(data.reviews || [])
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </main>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12">
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

  const totalDuration = course.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm font-medium">
                  {course.level}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {course.title}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({course.total_reviews} reviews)</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{course.lessonCount} lessons</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{Math.ceil(totalDuration / 60)}h total</span>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">About this course</h2>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {course.instructor.profile_picture_url ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={course.instructor.profile_picture_url}
                        alt={course.instructor.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {course.instructor.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor.bio || 'Expert Instructor'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Course Content</h2>
              <div className="space-y-2">
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons
                    .sort((a, b) => a.position - b.position)
                    .map((lesson) => (
                      <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <h3 className="font-medium text-foreground">{lesson.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {lesson.duration ? `${lesson.duration} min` : 'Duration not specified'}
                              </p>
                            </div>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                              Watch
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <p className="text-muted-foreground">No lessons available yet</p>
                )}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground">
                              {review.user.full_name}
                            </p>
                            <div className="flex items-center gap-1 text-yellow-500 mt-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-4xl font-bold text-primary">${course.price.toFixed(2)}</p>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href={`/checkout/${course.id}`}>Enroll Now</Link>
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/courses`}>Browse More</Link>
                </Button>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{course.lessonCount} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{Math.ceil(totalDuration / 60)}h total</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
