import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['client', 'freelancer', 'both'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', UserSchema)

export default User
