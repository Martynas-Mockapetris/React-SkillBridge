import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  // User information
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
    enum: ['client', 'freelancer', 'both', 'admin'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // New profile fields
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  skills: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },

  // Social links
  website: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  linkedin: {
    type: String,
    trim: true
  },
  twitter: {
    type: String,
    trim: true
  },

  // Freelancer specific details
  hourlyRate: {
    type: Number
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'entry'
  },
  languages: {
    type: String,
    trim: true
  },
  certifications: {
    type: String,
    trim: true
  },
  serviceCategories: {
    type: String,
    trim: true
  },
  upworkProfile: {
    type: String,
    trim: true
  },
  fiverrProfile: {
    type: String,
    trim: true
  },

  // Profile picture
  profilePicture: {
    type: String,
    default: ''
  }
})

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', UserSchema)

export default User
