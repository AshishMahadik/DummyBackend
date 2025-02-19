const mongoose = require('mongoose');
const { paginate } = require('./plugins');

const emailSchema = mongoose.Schema(
  {
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    subject: {
      type: String,
    },
    text: {
      type: String,
    },
    html: {
      type: String,
    },
  },
  { timestamps: true },
);

emailSchema.plugin(paginate);

/**
 * @typedef Email
 */

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
