import dbConnect from '@/lib/mongoose'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'
import { TCategoryReview } from '@/lib/types'

// Post this route
export async function PATCH(req: Request) {
  try {
    await dbConnect()
    const { user_id, route_id, review }: { user_id: string; route_id: string; review: TCategoryReview[] } =
      await req.json()

    const totalScore = review
      ?.map((review) => review.review_score)
      .reduce((sum: number, score) => sum + (score ?? 0), 0)
    const totalPossibleScore = review
      ?.map((review) => review.total_score)
      .reduce((sum: number, score) => sum + (score ?? 0), 0)
    const finalScore =
      totalScore && totalPossibleScore && totalPossibleScore !== 0
        ? ((totalScore / totalPossibleScore) * 100).toFixed(2)
        : 0

    const updatedRoute = await Route.findOneAndUpdate(
      { user_id: new mongoose.Types.ObjectId(user_id as string), _id: new mongoose.Types.ObjectId(route_id as string) },
      { review: review, final_score: finalScore }
    )

    return NextResponse.json(updatedRoute, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
