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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    let courseQuery = supabase
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
        instructor:instructor_id(id, full_name),
        lesson_count:lessons(count)
      `,
        { count: 'exact' }
      )
      .eq('status', 'published')

    if (query) {
      courseQuery = courseQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    if (category) {
      courseQuery = courseQuery.eq('category', category)
    }

    const { data: courses, error, count } = await courseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        courses,
        total: count,
        limit,
        offset,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
