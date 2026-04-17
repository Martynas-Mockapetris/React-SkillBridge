import mongoose from 'mongoose'

const adminActionLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actorRole: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    targetType: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    targetLabel: {
      type: String,
      trim: true,
      default: ''
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    changes: {
      type: [
        {
          field: {
            type: String,
            required: true,
            trim: true
          },
          before: {
            type: mongoose.Schema.Types.Mixed,
            default: null
          },
          after: {
            type: mongoose.Schema.Types.Mixed,
            default: null
          }
        }
      ],
      default: []
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    context: {
      ipAddress: {
        type: String,
        trim: true,
        default: ''
      },
      userAgent: {
        type: String,
        trim: true,
        default: ''
      }
    }
  },
  {
    timestamps: true
  }
)

adminActionLogSchema.index({ createdAt: -1 })
adminActionLogSchema.index({ actor: 1, createdAt: -1 })
adminActionLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 })

const AdminActionLog = mongoose.model('AdminActionLog', adminActionLogSchema)

export default AdminActionLog
