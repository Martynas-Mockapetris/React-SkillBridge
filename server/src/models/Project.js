import mongoose from 'mongoose'

const projectSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled', 'inactive', 'archived', 'paused', 'in progress', 'under review'],
      default: 'draft'
    },
    attachments: [
      {
        name: String,
        path: String,
        mimetype: String
      }
    ],
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
    ]
  },
  {
    timestamps: true
  }
)

const Project = mongoose.model('Project', projectSchema)

export default Project
