import mongoose from 'mongoose'

const ConnectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true })
ConnectionSchema.index({ recipient: 1, status: 1 })
ConnectionSchema.index({ requester: 1, status: 1 })

export default mongoose.model('Connection', ConnectionSchema)
