import mongoose from 'mongoose'

const projectSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      required: true
    },
    budget: {
      type: Number,
      required: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    deadline: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'assigned', 'negotiating', 'in_progress', 'under_review', 'completed', 'cancelled', 'cancelled_by_admin', 'deleted_by_owner', 'inactive', 'archived', 'paused'],
      default: 'draft'
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lockReason: {
      type: String,
      default: ''
    },
    lockDurationDays: {
      type: Number,
      default: null
    },
    lockedAt: {
      type: Date,
      default: null
    },
    lockExpiresAt: {
      type: Date,
      default: null
    },
    attachments: [
      {
        name: String,
        path: String,
        mimetype: String
      }
    ],
    submission: {
      links: {
        type: [String],
        default: []
      },
      files: [
        {
          name: String,
          path: String,
          mimetype: String
        }
      ],
      note: {
        type: String,
        default: ''
      },
      submittedAt: {
        type: Date
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    review: {
      decision: {
        type: String,
        enum: ['accepted', 'declined']
      },
      feedback: {
        type: String,
        default: ''
      },
      reviewedAt: {
        type: Date
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    interestedUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending'
        },
        contactedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isRated: {
      type: Boolean,
      default: false
    },
    rateNegotiation: {
      status: {
        type: String,
        enum: ['none', 'proposed', 'countered', 'accepted'],
        default: 'none'
      },
      currentOffer: {
        amount: { type: Number },
        type: { type: String, enum: ['hourly', 'fixed'], default: 'hourly' },
        proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        proposedAt: { type: Date }
      },
      history: [
        {
          amount: { type: Number },
          type: { type: String, enum: ['hourly', 'fixed'], default: 'hourly' },
          proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          proposedAt: { type: Date }
        }
      ],
      agreedAt: { type: Date }
    }
  },
  {
    timestamps: true
  }
)

projectSchema.methods.ensureUnlockedIfExpired = async function () {
  if (this.isLocked && this.lockExpiresAt && this.lockExpiresAt < new Date()) {
    this.isLocked = false
    this.lockReason = ''
    this.lockDurationDays = null
    this.lockedAt = null
    this.lockExpiresAt = null

    if (this.status === 'paused') {
      this.status = 'active'
    }

    await this.save()
  }

  return this
}

const Project = mongoose.model('Project', projectSchema)

export default Project
