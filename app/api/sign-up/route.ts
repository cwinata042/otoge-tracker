import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { email, password } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: 'Email already in use.' }, { status: 409 })
    }

    await User.create({ email, password: hashedPassword })

    return NextResponse.json({ message: 'User created.' }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'An occurred when creating the user.' }, { status: 500 })
  }
}
