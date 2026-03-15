import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(
        `
        id,
        title,
        description,
        thumbnail_url,
        price,
        rating,
        total_reviews,
        category,
        level,
        created_at,
        instructor:instructor_id(id, full_name, bio, profile_picture_url),
        lessons(id, title, position, video_url, duration)
      `
      )
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        user:user_id(id, full_name)
      `
      )
      .eq('course_id', id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json(
      {
        course: {
          ...course,
          lessonCount: course.lessons?.length || 0,
        },
        reviews: reviews || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}
