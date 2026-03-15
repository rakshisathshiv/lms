'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Header from '@/components/header'
import CourseCard from '@/components/course-card'
import { Spinner } from '@/components/ui/spinner'

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  rating: number
  total_reviews: number
  instructor: { id: string; full_name: string }
  lesson_count: Array<unknown>
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params = new URLSearchParams({
          limit: '12',
          offset: '0',
        })
        if (searchQuery) {
          params.append('q', searchQuery)
        }
        const res = await fetch(`/api/courses?${params}`)
        const data = await res.json()
        setCourses(data.courses || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [searchQuery])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Learn Without Limits
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Discover thousands of courses from industry experts. Master new skills, advance your career, and transform your future.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/courses">Explore Courses</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Courses</h2>
              <p className="mt-2 text-muted-foreground">
                Handpicked courses to help you grow
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/courses">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.slice(0, 8).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <p className="mt-2 text-muted-foreground">Students Enrolled</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">500+</div>
              <p className="mt-2 text-muted-foreground">Expert Instructors</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">1000+</div>
              <p className="mt-2 text-muted-foreground">Quality Courses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">95%</div>
              <p className="mt-2 text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>&copy; 2024 EduConnect. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
