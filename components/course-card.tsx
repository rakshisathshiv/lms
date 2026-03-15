import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Star, Users, Clock } from 'lucide-react'
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
  lesson_count: Array<unknown>
}

export default function CourseCard({ course }: { course: Course }) {
  const lessonCount = course.lesson_count?.[0]?.count || 0

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="relative h-40 bg-muted overflow-hidden">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <CardHeader className="pb-3">
          <h3 className="font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground">{course.instructor.full_name}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span>{course.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({course.total_reviews})</span>
            </div>
            <span className="text-primary font-bold">${course.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{lessonCount} lessons</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
