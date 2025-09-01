import dbConnect from '@/lib/mongoose'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'
import { TRoute } from '@/lib/types'

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

// Add a new route
export async function POST(req: Request) {
  try {
    await dbConnect()
    const { user_id, game_id, route }: { user_id: string; game_id: string; route: TRoute } = await req.json()

    const newRoute = new Route({
      game_id: game_id,
      user_id: user_id,
      ...route,
    })

    await newRoute.save()

    return NextResponse.json(newRoute, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
