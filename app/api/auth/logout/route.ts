// Logout is handled client-side with Supabase Auth
// This endpoint is kept for backward compatibility
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { message: 'Logout handled client-side' },
    { status: 200 }
  )
}
