import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, email, and message are required' }, { status: 400 })
    }

    const entry = {
      receivedAt: new Date().toISOString(),
      name,
      email,
      phone,
      message,
    }

    console.info('[contact]', JSON.stringify(entry))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
}
