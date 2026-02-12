import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema(
  {
    // Reference to the freelancer who created this announcement
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Hourly rate the freelancer charges (in EUR)
    hourlyRate: {
      type: Number,
      required: true,
      min: 0
    },

    // Array of skills the freelancer is offering
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0
        },
        message: 'At least one skill is required'
      }
    },

    // Background/experience description (e.g., "5 years in React development")
    background: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500
    },

    // Short title for the announcement
    title: {
      type: String,
      required: true,
      maxlength: 100
    },

    // Whether the announcement is active (can be paused/unpaused)
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

const Announcement = mongoose.model('Announcement', announcementSchema)
export default Announcement
