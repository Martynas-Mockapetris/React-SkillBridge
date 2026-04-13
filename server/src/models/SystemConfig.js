import mongoose from 'mongoose'

const sectionSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedAt: { type: Date, default: Date.now },
    values: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
)

const systemConfigSchema = new mongoose.Schema(
  {
    home: { type: sectionSchema, default: () => ({}) },
    pricing: { type: sectionSchema, default: () => ({}) },
    testimonials: { type: sectionSchema, default: () => ({}) },
    blog: { type: sectionSchema, default: () => ({}) },
    about: { type: sectionSchema, default: () => ({}) },
    contact: { type: sectionSchema, default: () => ({}) },
    mail: { type: sectionSchema, default: () => ({}) },
    system: { type: sectionSchema, default: () => ({}) }
  },
  { timestamps: true }
)

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema)

export default SystemConfig
