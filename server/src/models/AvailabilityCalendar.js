import mongoose from 'mongoose'

const availabilityDaySchema = new mongoose.Schema(
  {
    date: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    status: {
      type: String,
      enum: ['red', 'orange', 'yellow', 'green'],
      default: 'green'
    },
    capacity: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      }
    ],
    manualStatus: {
      type: String,
      enum: ['unavailable', 'busy', 'available', null],
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
)

const availabilityCalendarSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    days: [availabilityDaySchema],
    isPublic: {
      type: Boolean,
      default: true
    },
    lastUpdatedReason: {
      type: String,
      enum: ['manual', 'project_assignment', 'project_completion', 'auto_calculated'],
      default: 'manual'
    }
  },
  {
    timestamps: true,
    indexes: [
      {
        key: { freelancer: 1, year: 1, month: 1 },
        unique: true
      }
    ]
  }
)

const AvailabilityCalendar = mongoose.model('AvailabilityCalendar', availabilityCalendarSchema)

export default AvailabilityCalendar
