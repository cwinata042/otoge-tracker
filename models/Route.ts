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
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Character', 'Other'],
      required: true,
    },
    route_img_link: {
      type: String,
      default: 'https://placehold.co/120x150/png',
    },
    status: {
      type: String,
      enum: ['Completed', 'Incomplete', 'Playing', 'On Hold', 'Dropped'],
      default: 'Incomplete',
      required: true,
    },
    started_at: {
      type: Date,
    },
    completed_at: {
      type: Date,
    },
    final_score: {
      type: mongoose.Types.Double,
    },
    review: [
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
        note: {
          type: String,
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    started_date: {
      type: Date,
      default: null,
    },
    completed_date: {
      type: Date,
      default: null,
    },
    voice_actor: {
      romanized: {
        type: String,
        default: '',
      },
      orig: {
        type: String,
        default: '',
      },
    },
    vndb_id: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Route || mongoose.model('Route', routeSchema)
