import dbConnect from '@/lib/mongoose'
import OwnedGame from '@/models/OwnedGame'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'

export async function GET(req: Request) {
  try {
    await dbConnect()
    const userId = req.headers.get('UserId')
    const ownedGames = await OwnedGame.find({
      user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
    }) /* find all owned games in the database */
    return NextResponse.json(ownedGames, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const {
      user_id,
      vndb_id,
      orig_title,
      title,
      type,
      status,
      img_link,
      owned_copies,
      routes,
      route_order,
      description,
    } = await req.json()
    const newOwnedGame = new OwnedGame({
      user_id,
      vndb_id,
      orig_title,
      title,
      type,
      status,
      img_link,
      owned_copies,
      route_order,
      description,
    })
    await newOwnedGame.save()

    if (routes.length > 0) {
      const newOwnedGameId = newOwnedGame._id
      const routesArray = routes.map((route: any) => {
        return {
          ...route,
          user_id: new mongoose.Types.ObjectId(user_id),
          game_id: new mongoose.Types.ObjectId(newOwnedGameId),
        }
      })
      const newRoutes = await Route.insertMany(routesArray)
    }

    return NextResponse.json(newOwnedGame, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
