import dbConnect from '@/lib/mongoose'
import OwnedGame from '@/models/OwnedGame'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'

export async function GET(req: Request) {
  try {
    await dbConnect()
    const gameId = req.url.split('/').pop()
    const userId = req.headers.get('UserId')
    const game = await OwnedGame.find({
      user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
      _id: new mongoose.Types.ObjectId(gameId ? gameId : ''),
    }) /* find all owned games in the database */
    const gameRoutes = await Route.find({
      user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
      game_id: new mongoose.Types.ObjectId(gameId ? gameId : ''),
    })
    let combined = {}
    if (game) {
      combined = {
        ...game[0]._doc,
        routes: gameRoutes,
      }
    }
    return NextResponse.json(combined, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
