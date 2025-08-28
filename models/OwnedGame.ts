import mongoose from 'mongoose'

const ownedGameSchema = new mongoose.Schema(
  {
    vndb_id: {
      type: String,
    },
    orig_title: {
      type: String,
      required: [true, "Please provide the game's title in its original language."],
    },
    title: {
      type: String,
      required: [true, "Please provide the game's title to be displayed."],
    },
    type: {
      type: String,
      enum: ['Main', 'Fandisc'],
      required: true,
      default: 'Main',
    },
    status: {
      type: String,
      enum: ['Completed', 'Incomplete', 'Playing', 'On Hold', 'Dropped'],
      default: 'Incomplete',
    },
    img_link: {
      type: String,
      default: 'https://placehold.co/400x600',
    },
    owned_copies: [
      {
        language: {
          type: String,
          enum: ['EN', 'JP'],
          required: [true, "Please provide the game copy's language."],
        },
        platform: {
          type: String,
          enum: ['Switch', 'PS Vita', 'PC'],
          required: [true, "Please provide the game copy's platform."],
        },
        price: {
          type: Number,
        },
        price_currency: {
          type: String,
          enum: ['USD', 'JPY'],
        },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.models.OwnedGame || mongoose.model('OwnedGame', ownedGameSchema)
