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
    enum: ['client', 'freelancer', 'both', 'moderator', 'blogger', 'config_manager', 'admin'],
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockReason: {
    type: String,
    trim: true,
    default: ''
  },
  lockExpiresAt: {
    type: Date,
    default: null
  },
  lockDurationDays: {
    type: Number,
    default: null
  },
  lockedAt: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  emailVerificationTokenHash: {
    type: String,
    default: null,
    select: false
  },
  emailVerificationTokenExpiresAt: {
    type: Date,
    default: null,
    select: false
  },
  emailVerificationLastSentAt: {
    type: Date,
    default: null
  },
  passwordResetTokenHash: {
    type: String,
    default: null,
    select: false
  },
  passwordResetTokenExpiresAt: {
    type: Date,
    default: null,
    select: false
  },
  forcePasswordReset: {
    type: Boolean,
    default: false
  },
  forcePasswordResetSetAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  },
  adminTags: {
    type: [String],
    default: []
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
  headline: {
    type: String,
    trim: true,
    default: ''
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'limited', 'unavailable'],
    default: 'available'
  },
  profileVisibility: {
    type: String,
    enum: ['public', 'members', 'private'],
    default: 'public'
  },
  responseTime: {
    type: String,
    enum: ['within_24_hours', 'within_3_days', 'within_week', 'flexible'],
    default: 'within_24_hours'
  },
  servicesOffered: {
    type: String,
    trim: true,
    default: ''
  },
  tools: {
    type: String,
    trim: true,
    default: ''
  },
  workPreference: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite', 'flexible'],
    default: 'flexible'
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: 0
  },
  minimumProjectBudget: {
    type: Number,
    min: 0,
    default: null
  },
  preferredProjectSize: {
    type: String,
    enum: ['small', 'medium', 'large', 'ongoing', 'flexible'],
    default: 'flexible'
  },
  preferredEngagements: {
    type: [String],
    default: []
  },
  timezone: {
    type: String,
    trim: true,
    default: ''
  },
  availabilityDetails: {
    type: String,
    trim: true,
    default: ''
  },
  industries: {
    type: String,
    trim: true,
    default: ''
  },
  showLocationPublic: {
    type: Boolean,
    default: true
  },
  showHourlyRate: {
    type: Boolean,
    default: true
  },
  allowDirectMessages: {
    type: Boolean,
    default: true
  },
  allowProjectInvites: {
    type: Boolean,
    default: true
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  emailNotificationsMessages: {
    type: Boolean,
    default: true
  },
  emailNotificationsConnections: {
    type: Boolean,
    default: true
  },
  emailNotificationsProjects: {
    type: Boolean,
    default: true
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

  // Favorite projects
  favorites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Project',
    default: []
  },

  // Legacy freelancer bookmarks kept temporarily for compatibility with older flows
  favoriteFreelancers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },

  // Profile picture
  profilePicture: {
    type: String,
    default: ''
  },

  // Rating system for freelancers
  ratings: {
    type: [
      {
        ratedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        score: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        feedback: {
          type: String,
          trim: true
        },
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project',
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },

  // Average rating
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // Total ratings count
  totalRatings: {
    type: Number,
    default: 0
  }
})

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

UserSchema.methods.ensureUnlockedIfExpired = async function () {
  if (this.isLocked && this.lockExpiresAt && this.lockExpiresAt < new Date()) {
    this.isLocked = false
    this.lockReason = ''
    this.lockExpiresAt = null
    this.lockDurationDays = null
    this.lockedAt = null
    await this.save()
  }
}

const User = mongoose.model('User', UserSchema)

export default User
