const mongoose = require('mongoose');
const { effectivePlanId, limitsFor } = require('../utils/plans');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true, select: false },
    // Marks accounts created by the seed script so demo data stays separate from real users.
    isDemo: { type: Boolean, default: false },
    // Billing
    plan: { type: String, enum: ['free', 'pro', 'team'], default: 'free' },
    planExpiresAt: { type: Date, default: null },
    // Premium: user-defined categories
    customCategories: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.effectivePlan = effectivePlanId(doc); // what the user can use right now
        ret.limits = limitsFor(doc);
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
