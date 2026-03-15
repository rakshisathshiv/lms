'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { BookOpen, Plus, Edit2, Trash2, Eye, BarChart3 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Image from 'next/image'

interface Course {
  id: string
  title: string
  description: string
  price: number
  status: 'draft' | 'published'
  created_at: string
  lessons: Array<unknown>
}

export default function InstructorPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (!authLoading && user && user.role !== 'instructor' && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/instructor/courses')
        const data = await res.json()
        setCourses(data.courses || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'instructor' || user?.role === 'admin') {
      fetchCourses()
    }
  }, [user])

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setCourses(courses.filter((c) => c.id !== courseId))
      }
    } catch (error) {
      console.error('Error deleting course:', error)
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

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Instructor Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your courses and track student progress
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/instructor/create-course">
              <Plus className="w-4 h-4" />
              Create Course
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary">{courses.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary">
                {courses.filter((c) => c.status === 'published').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary">
                {courses.filter((c) => c.status === 'draft').length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Drafts</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {course.title}
                        </h3>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            course.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>${course.price.toFixed(2)}</span>
                        <span>•</span>
                        <span>{course.lessons?.length || 0} lessons</span>
                        <span>•</span>
                        <span>
                          Created {new Date(course.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link href={`/instructor/courses/${course.id}`}>
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link href={`/courses/${course.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link href={`/instructor/courses/${course.id}/analytics`}>
                          <BarChart3 className="w-4 h-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this course? This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex gap-3 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCourse(course.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
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
                Create your first course to start teaching students.
              </p>
              <Button asChild>
                <Link href="/instructor/create-course">Create Course</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
