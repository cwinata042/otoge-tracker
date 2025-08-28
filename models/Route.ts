import mongoose from 'mongoose'

const routeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    game_id: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ['Character', 'Other'],
      required: true,
    },
    route_img_link: {
      type: String,
      default: 'https://placehold.co/400x600',
    },
    status: {
      type: String,
      enum: ['Completed', 'Incomplete', 'Playing', 'On Hold', 'Dropped'],
      default: 'Incomplete',
      required: true,
    },
    review: {
      scores: [
        {
          category: {
            type: String,
            required: true,
          },
          score: {
            type: mongoose.Types.Double,
            required: true,
          },
          review_score: {
            type: mongoose.Types.Double,
            required: true,
          },
          total_score: {
            type: mongoose.Types.Double,
            required: true,
          },
        },
      ],
      notes: [
        {
          category: {
            type: String,
            required: true,
          },
          name: {
            type: String,
          },
          content: {
            type: String,
          },
        },
      ],
    },
  },
  { timestamps: true }
)

export default mongoose.models.Route || mongoose.model('Route', routeSchema)
