'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Lesson {
  id: string
  title: string
  position: number
  video_url: string
  duration: number
  description?: string
}

interface Course {
  id: string
  title: string
  lessons: Lesson[]
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

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

        const lesson = data.course.lessons.find((l: Lesson) => l.id === lessonId)
        if (lesson) {
          setCurrentLesson(lesson)
        }
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId && lessonId) {
      fetchCourse()
    }
  }, [courseId, lessonId])

  const handleLessonComplete = async () => {
    if (!user || !currentLesson) return

    try {
      // Record lesson progress
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId: currentLesson.id,
          completed: true,
        }),
      })

      setCompletedLessons([...completedLessons, currentLesson.id])
    } catch (error) {
      console.error('Error recording progress:', error)
    }
  }

  const goToNextLesson = () => {
    if (!course || !currentLesson) return
    const currentIndex = course.lessons.findIndex((l) => l.id === lessonId)
    if (currentIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentIndex + 1]
      router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)
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

  if (!course || !currentLesson) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Lesson not found</p>
          </div>
        </div>
      </main>
    )
  }

  const isLessonCompleted = completedLessons.includes(currentLesson.id)
  const currentIndex = course.lessons.findIndex((l) => l.id === lessonId)
  const isLastLesson = currentIndex === course.lessons.length - 1

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button asChild variant="outline" className="mb-6">
          <Link href={`/courses/${courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Video Player */}
            <Card className="mb-6 overflow-hidden">
              <div className="relative h-96 bg-black flex items-center justify-center">
                {currentLesson.video_url ? (
                  <video
                    src={currentLesson.video_url}
                    controls
                    className="w-full h-full"
                    onEnded={handleLessonComplete}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Video not available</p>
                    <Button onClick={handleLessonComplete} variant="outline">
                      Mark as Complete
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Lesson Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{currentLesson.duration} minutes</span>
                      {isLessonCompleted && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Completed</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.description && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">About this lesson</h3>
                    <p className="text-foreground whitespace-pre-wrap">
                      {currentLesson.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {!isLessonCompleted && (
                    <Button onClick={handleLessonComplete} className="flex-1">
                      Mark as Complete
                    </Button>
                  )}
                  {!isLastLesson && (
                    <Button onClick={goToNextLesson} variant="outline" className="flex-1">
                      Next Lesson →
                    </Button>
                  )}
                  {isLastLesson && (
                    <Button asChild className="flex-1">
                      <Link href={`/courses/${courseId}`}>
                        Back to Course
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Course Lessons */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${courseId}/lessons/${lesson.id}`}
                      className={`block p-3 rounded-lg transition-colors ${
                        lesson.id === lessonId
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {completedLessons.includes(lesson.id) && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground">
                            Lesson {index + 1}
                          </p>
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {lesson.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
