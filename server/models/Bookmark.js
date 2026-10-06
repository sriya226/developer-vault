const mongoose = require('mongoose');
const { RESOURCE_TYPES } = require('../utils/constants');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    website: { type: String, trim: true, maxlength: 200, default: '' },
    previewImage: { type: String, trim: true, maxlength: 2048, default: '' },
    favicon: { type: String, trim: true, maxlength: 2048, default: '' },
    category: { type: String, trim: true, maxlength: 40, default: 'Other' }, // built-in or user's custom category (validated in controller)
    resourceType: { type: String, enum: RESOURCE_TYPES, default: 'Other' },
    tags: { type: [String], default: [] },
    favorite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Every query is scoped by userId, so all indexes lead with it.
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ userId: 1, updatedAt: -1 });
bookmarkSchema.index({ userId: 1, title: 1 });
bookmarkSchema.index({ userId: 1, category: 1 });
bookmarkSchema.index({ userId: 1, resourceType: 1 });
bookmarkSchema.index({ userId: 1, favorite: 1 });
bookmarkSchema.index({ userId: 1, tags: 1 });
bookmarkSchema.index({ userId: 1, url: 1 }, { unique: true }); // no duplicate URLs per user

module.exports = mongoose.model('Bookmark', bookmarkSchema);
