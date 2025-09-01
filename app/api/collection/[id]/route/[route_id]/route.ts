import dbConnect from '@/lib/mongoose'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'

// Post this route
export async function PATCH(req: Request) {
  try {
    await dbConnect()
    const { user_id, route_id, review } = await req.json()
    const updatedRoute = await Route.findOneAndUpdate(
      { user_id: new mongoose.Types.ObjectId(user_id as string), _id: new mongoose.Types.ObjectId(route_id as string) },
      { review: review }
    )

    return NextResponse.json(updatedRoute, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
