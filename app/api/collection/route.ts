import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/mongoose'
import OwnedGame from '@/models/OwnedGame'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    await dbConnect()
    const ownedGames = await OwnedGame.find({}) /* find all owned games in the database */
    return NextResponse.json(ownedGames, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}

export async function POST(req: Request) {
  await dbConnect()
  const { vndb_id, orig_title, title, type, status, img_link, owned_copies } = await req.json()
  const newOwnedGame = new OwnedGame({ vndb_id, orig_title, title, type, status, img_link, owned_copies })
  await newOwnedGame.save()
  return NextResponse.json(newOwnedGame, { status: 201 })
}
