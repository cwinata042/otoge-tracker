import dbConnect from '@/lib/mongoose'
import OwnedGame from '@/models/OwnedGame'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'
import { TOwnedGame } from '@/lib/types'

// Get a single game's details, including its routes
export async function GET(req: Request) {
  try {
    await dbConnect()
    const gameId = req.url.split('/').pop()
    const userId = req.headers.get('UserId')
    const game = await OwnedGame.find({
      user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
      _id: new mongoose.Types.ObjectId(gameId ? gameId : ''),
    })
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

// Deletes a single game and its routes
// Takes in a body with the gameId and userId
export async function DELETE(req: Request) {
  try {
    await dbConnect()
    const { gameId, userId } = await req.json()

    const deletedGame = await OwnedGame.findOneAndDelete({ _id: gameId, user_id: userId })
    const deletedRoutes = await Route.deleteMany({ _id: gameId, user_id: userId })

    return NextResponse.json(deletedGame, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 400 })
  }
}

// Edits a single game's details but not its routes
export async function PATCH(req: Request) {
  try {
    await dbConnect()
    const { gameId, userId, game }: { gameId: string; userId: string; game: TOwnedGame } = await req.json()

    const editedGame = await OwnedGame.findOneAndUpdate(
      { _id: gameId, user_id: userId },
      {
        vndb_id: game.vndb_id,
        orig_title: game.orig_title,
        title: game.title,
        type: game.type,
        status: game.status,
        img_link: game.img_link,
        owned_copies: game.owned_copies,
      }
    )

    return NextResponse.json(editedGame, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 400 })
  }
}
