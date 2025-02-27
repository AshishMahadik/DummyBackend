const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
      minlength: 8,
    },
    role: { type: String, enum: ['admin', 'employee'], default: 'admin' },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema);
