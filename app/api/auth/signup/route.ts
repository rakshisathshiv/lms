// This endpoint is no longer needed - signup is handled client-side with Supabase Auth
// Kept for backward compatibility
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Please use client-side authentication' },
    { status: 400 }
  )
}
