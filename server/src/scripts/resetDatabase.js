import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Announcement from '../models/Announcement.js'

dotenv.config()

const resetDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    console.log('⚠️  WARNING: This will DELETE all data!')
    console.log('Clearing database...')

    const userResult = await User.deleteMany({})
    const projectResult = await Project.deleteMany({})
    const announcementResult = await Announcement.deleteMany({})

    console.log(`✅ Deleted ${userResult.deletedCount} users`)
    console.log(`✅ Deleted ${projectResult.deletedCount} projects`)
    console.log(`✅ Deleted ${announcementResult.deletedCount} announcements`)

    console.log('✅ Database cleared successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    process.exit(1)
  }
}

resetDatabase()
