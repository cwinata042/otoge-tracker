import mongoose from 'mongoose'

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('Connected to database!')
  } catch (err) {
    console.log(err)
  }
}

export default dbConnect
