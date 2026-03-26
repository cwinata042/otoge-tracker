import dbConnect from '@/lib/mongoose'
import OwnedGame from '@/models/OwnedGame'
import Route from '@/models/Route'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    await dbConnect()
    const userId = req.headers.get('UserId')
    const mode = req.headers.get('Mode')
    let characters, games

    if (mode === 'overall') {
      // find total savings in USD
      // find total savings in JPY

      // total completed games
      // total ongoing games
      // total dropped games
      // total on hold games
      // total games

      // total completed, ongoing, dropped, on hold, and all routes

      // shortest time taken to finish game (and what game)
      // longest time taken to finish game (and what game)

      // same but for route

      characters = await Route.find({
        user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
        type: 'Character',
        review: { $exists: true, $ne: [] },
      }).sort('final_score') /* find all characters in the database by total score descending */
    } else {
      characters = await Route.find({
        user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
        type: 'Character',
      }).sort('name') /* find all characters in the database by name */
    }

    return NextResponse.json(characters, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 })
  }
}
