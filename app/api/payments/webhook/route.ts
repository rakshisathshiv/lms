import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripeKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables')
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20',
})

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const metadata = session.metadata
      if (!metadata || !metadata.userId || !metadata.courseId) {
        console.error('Missing metadata in session')
        return NextResponse.json(
          { error: 'Invalid session metadata' },
          { status: 400 }
        )
      }

      const { userId, courseId } = metadata

      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
        })

      if (enrollmentError) {
        console.error('Enrollment creation error:', enrollmentError)
        // Don't fail the webhook - enrollment might already exist
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          course_id: courseId,
          stripe_session_id: session.id,
          amount: (session.amount_total || 0) / 100,
          status: 'completed',
          payment_method: session.payment_method_types?.[0] || 'card',
        })

      if (paymentError) {
        console.error('Payment record creation error:', paymentError)
      }
    }

    // Handle charge.refunded event
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge

      const { error } = await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('stripe_session_id', charge.payment_intent)

      if (error) {
        console.error('Payment refund error:', error)
      }
    }

    return NextResponse.json(
      { received: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
