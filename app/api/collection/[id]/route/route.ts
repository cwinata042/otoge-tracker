import dbConnect from '@/lib/mongoose'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'

// Get all routes for this game
export async function GET(req: Request) {
  try {
    await dbConnect()
    const userId = req.headers.get('UserId')
    const gameId = req.url.split('/').pop()
    const routes = await Route.find({
      user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
      game_id: gameId,
    })
    return NextResponse.json(routes, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
