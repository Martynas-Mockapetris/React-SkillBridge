import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320
    },
    content: {
      type: String,
      required: true,
      minlength: 50
    },
    coverImage: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    authorName: {
      type: String,
      trim: true,
      default: ''
    },
    showAuthor: {
      type: Boolean,
      default: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

const BlogPost = mongoose.model('BlogPost', blogPostSchema)

export default BlogPost
