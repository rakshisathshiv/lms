// Session is handled client-side with Supabase Auth
// This endpoint is kept for backward compatibility
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { user: null, message: 'Session handled client-side' },
    { status: 200 }
  )
}
