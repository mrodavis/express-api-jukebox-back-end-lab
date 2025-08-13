const { Schema, model } = require('mongoose');

const urlValidator = v => !v || /^https?:\/\//i.test(v);

const trackSchema = new Schema(
  {
    title:  { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    coverArtUrl: {
      type: String, trim: true,
      validate: { validator: urlValidator, message: 'coverArtUrl must be a valid http(s) URL' }
    },
    soundClipUrl: {
      type: String, trim: true,
      validate: { validator: urlValidator, message: 'soundClipUrl must be a valid http(s) URL' }
    },
  },
  { timestamps: true }
);

// (Optional) avoid exact duplicates
trackSchema.index({ title: 1, artist: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = model('Track', trackSchema);

