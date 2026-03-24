import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRoutes from './src/routes/authRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import projectRoutes from './src/routes/projectRoutes.js'
import messageRoutes from './src/routes/messageRoutes.js'
import announcementRoutes from './src/routes/announcementRoutes.js'
import ratingRoutes from './src/routes/ratingRoutes.js'
import configRoutes from './src/routes/configRoutes.js'
import { startProjectAutoUnlockScheduler } from './src/utils/projectLockScheduler.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error))

startProjectAutoUnlockScheduler()

// Routes
app.get('/', (req, res) => {
  res.send('SkillBridge API is running')
})

// Auth routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/config', configRoutes)

// Serve uploaded files
app.use('/uploads', express.static('uploads'))

// Port
const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
