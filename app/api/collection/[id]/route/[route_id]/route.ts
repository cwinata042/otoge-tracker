import dbConnect from '@/lib/mongoose'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Route from '@/models/Route'
import { TCategoryReview, TRoute } from '@/lib/types'
import OwnedGame from '@/models/OwnedGame'

// Post this route
export async function PATCH(req: Request) {
  try {
    await dbConnect()
    const {
      user_id,
      route_id,
      game_id,
      review,
      route,
    }: { user_id: string; route_id: string; game_id: string; review: TCategoryReview[]; route: TRoute } = await req.json()
    const categoryWeights = [45, 30, 12.5, 12.5]

    let updatedRoute

    // If updating the entire route
    if (route) {
      const totalScore = route.review
        ?.map((review, index) => {
          // If there is no score, return null
          if (!review.review_score || review.review_score === 0) {
              return 0
            } else {
              return (review.review_score / review.total_score) * categoryWeights[index]
            }
          }
        )
        .reduce((sum: number, score) => sum + (score ?? 0), 0)

      updatedRoute = await Route.findOneAndUpdate(
        {
          user_id: new mongoose.Types.ObjectId(user_id as string),
          _id: new mongoose.Types.ObjectId(route_id as string),
        },
        {
          name: route.name,
          type: route.type,
          route_img_link: route.route_img_link,
          status: route.status,
          review: route.review,
          final_score: totalScore,
        }
      )
    } else {
      const totalScore = review
        ?.map((review, index) => {
          // If there is no score, return null
          if (!review.review_score || review.review_score === 0) {
              return 0
            } else {
              return (review.review_score / review.total_score) * categoryWeights[index]
            }
          }
        )
        .reduce((sum: number, score) => sum + (score ?? 0), 0)

      updatedRoute = await Route.findOneAndUpdate(
        {
          user_id: new mongoose.Types.ObjectId(user_id as string),
          _id: new mongoose.Types.ObjectId(route_id as string),
        },
        { review: review, final_score: totalScore }
      )
    }

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

    return NextResponse.json(updatedRoute, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}

// Delete this route
export async function DELETE(req: Request) {
  try {
    await dbConnect()
    const { user_id, route_id, game_id }: { user_id: string; route_id: string; game_id: string } = await req.json()

    const deletedRoute = await Route.findOneAndDelete({
      user_id: new mongoose.Types.ObjectId(user_id as string),
      _id: new mongoose.Types.ObjectId(route_id as string),
    })

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

    return NextResponse.json(deletedRoute, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
