import dbConnect from '@/lib/mongoose'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'
import { TRoute } from '@/lib/types'
import OwnedGame from '@/models/OwnedGame'

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
    return NextResponse.json({ error: error }, { status: 400 })
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

    // Updates the game's updatedAt field
    const updatedGame = await OwnedGame.findOneAndUpdate(
      {
        user_id: new mongoose.Types.ObjectId(user_id as string),
        _id: new mongoose.Types.ObjectId(game_id as string),
      },
      {
        updatedAt: new Date(0),
      }
    )

    return NextResponse.json(newRoute, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 })
  }
}
