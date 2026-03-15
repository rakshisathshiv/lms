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
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: certificates, error } = await supabase
      .from('certificates')
      .select(
        `
        id,
        course_id,
        issued_at,
        courses:course_id(id, title)
      `
      )
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(
      { certificates: certificates || [] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get certificates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
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

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'Missing course ID' },
        { status: 400 }
      )
    }

    // Check if user has completed all lessons
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get all lessons for the course
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)

    if (!lessons || lessons.length === 0) {
      return NextResponse.json(
        { error: 'Course has no lessons' },
        { status: 400 }
      )
    }

    // Check if all lessons are completed
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true)

    if (!completedLessons || completedLessons.length !== lessons.length) {
      return NextResponse.json(
        { error: 'You have not completed all lessons' },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Certificate already issued' },
        { status: 400 }
      )
    }

    // Create certificate
    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      { certificate },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create certificate error:', error)
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    )
  }
}
