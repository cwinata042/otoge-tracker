import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/mongoose'
import OwnedGame from '@/models/OwnedGame'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req

  await dbConnect()

  switch (method) {
    case 'GET' /* Get an owned game by its ID */:
      try {
        const ownedGame = await OwnedGame.findById(id)
        if (!ownedGame) {
          return res.status(400).json({ success: false })
        }
        res.status(200).json({ success: true, data: ownedGame })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    case 'PUT' /* Edit an owned game by its ID */:
      try {
        const ownedGame = await OwnedGame.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        })
        if (!ownedGame) {
          return res.status(400).json({ success: false })
        }
        res.status(200).json({ success: true, data: ownedGame })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    case 'DELETE' /* Delete an owned game by its ID */:
      try {
        const deletedGame = await OwnedGame.deleteOne({ _id: id })
        if (!deletedGame) {
          return res.status(400).json({ success: false })
        }
        res.status(200).json({ success: true, data: {} })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    default:
      res.status(400).json({ success: false })
      break
  }
}
