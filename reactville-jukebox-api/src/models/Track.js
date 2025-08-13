const { Schema, model } = require('mongoose');

const trackSchema = new Schema(
  {
    title:  { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = model('Track', trackSchema);
