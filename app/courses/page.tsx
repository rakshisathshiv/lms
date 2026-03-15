'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import CourseCard from '@/components/course-card'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { FieldGroup, FieldLabel } from '@/components/ui/field'

const CATEGORIES = [
  'All',
  'Development',
  'Business',
  'Design',
  'Marketing',
  'Data Science',
  'Personal Development',
]

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          limit: '24',
          offset: '0',
        })
        if (searchQuery) {
          params.append('q', searchQuery)
        }
        if (selectedCategory !== 'All') {
          params.append('category', selectedCategory.toLowerCase())
        }
        const res = await fetch(`/api/courses?${params}`)
        const data = await res.json()
        setCourses(data.courses || [])
        setTotal(data.total || 0)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchCourses, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Search Section */}
      <section className="bg-card border-b border-border px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-foreground mb-6">Explore Courses</h1>

          <FieldGroup>
            <FieldLabel htmlFor="search">Search courses</FieldLabel>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Search by title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </FieldGroup>

          {/* Categories */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {courses.length} of {total} courses
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No courses found. Try adjusting your search.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
