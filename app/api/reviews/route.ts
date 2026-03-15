import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing course ID' },
        { status: 400 }
      )
    }

    const { data: reviews, error } = await supabase
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
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(
      { reviews: reviews || [] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { courseId, rating, comment } = await request.json()

    if (!courseId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this course
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this course' },
        { status: 400 }
      )
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        course_id: courseId,
        rating,
        comment,
      })
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        user:user_id(id, full_name)
      `
      )
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      { review },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
