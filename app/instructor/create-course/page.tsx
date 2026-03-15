'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CATEGORIES = [
  'Development',
  'Business',
  'Design',
  'Marketing',
  'Data Science',
  'Personal Development',
  'Photography',
  'Music',
  'Other',
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function CreateCoursePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    thumbnail_url: '',
  })

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.title || !formData.description || !formData.category || !formData.level) {
        setError('Please fill in all required fields')
        return
      }

      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        setError('Please enter a valid price')
        return
      }

      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          level: formData.level,
          price,
          thumbnail_url: formData.thumbnail_url || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create course')
        return
      }

      const data = await res.json()
      router.push(`/instructor/courses/${data.course.id}`)
    } catch (err) {
      setError('An error occurred while creating the course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/instructor">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <FieldGroup>
                <FieldLabel htmlFor="title">Course Title *</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Complete Web Development Bootcamp"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="description">Description *</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this course..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  disabled={loading}
                  rows={5}
                />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup>
                  <FieldLabel htmlFor="category">Category *</FieldLabel>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel htmlFor="level">Level *</FieldLabel>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, level: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              </div>

              <FieldGroup>
                <FieldLabel htmlFor="price">Price (USD) *</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="thumbnail_url">Thumbnail URL</FieldLabel>
                <Input
                  id="thumbnail_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnail_url}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail_url: e.target.value })
                  }
                  disabled={loading}
                />
              </FieldGroup>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Course...' : 'Create Course'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/instructor">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
