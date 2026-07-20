import mongoose from 'mongoose'

const messageSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false
    },
    subject: {
      type: String,
      required: false,
      maxlength: 200
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    isRead: {
      type: Boolean,
      default: false
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true
        },
        originalName: {
          type: String,
          required: true
        },
        path: {
          type: String,
          required: true
        },
        mimetype: {
          type: String,
          required: true
        },
        size: {
          type: Number,
          required: true
        },
        uploadedAt: {
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

const Message = mongoose.model('Message', messageSchema)

export default Message
