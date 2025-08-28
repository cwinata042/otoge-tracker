import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/mongoose'
import OwnedGame from '@/models/OwnedGame'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { headers } from 'next/headers'

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
  await dbConnect()
  const { user_id, vndb_id, orig_title, title, type, status, img_link, owned_copies } = await req.json()
  const newOwnedGame = new OwnedGame({ user_id, vndb_id, orig_title, title, type, status, img_link, owned_copies })
  await newOwnedGame.save()
  return NextResponse.json(newOwnedGame, { status: 201 })
}
