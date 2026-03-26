import dbConnect from '@/lib/mongoose'
import Route from '@/models/Route'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    await dbConnect()
    const userId = req.headers.get('UserId')
    const mode = req.headers.get('Mode')
    let characters

    if (mode === 'stats') {
      characters = await Route.find({
        user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
        type: 'Character',
        review: { $exists: true, $ne: [] },
      }).sort('final_score') /* find all characters in the database by total score descending */
    } else {
      characters = await Route.find({
        user_id: new mongoose.Types.ObjectId(userId ? userId : ''),
        type: 'Character',
      }).sort('-name') /* find all characters in the database by total score descending */
    }

    return NextResponse.json(characters, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 })
  }
}
