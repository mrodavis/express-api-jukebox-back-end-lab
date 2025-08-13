const mongoose = require('mongoose');
const Track = require('../models/Track');
const ENABLE_ENRICHMENT = process.env.ENABLE_ENRICHMENT !== 'false';
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /tracks - Create
exports.create = async (req, res, next) => {
  try {
    const { title, artist, coverArtUrl, soundClipUrl } = req.body;
    if (!title || !artist) return res.status(400).json({ error: 'title and artist are required' });

    let payload = { title, artist, coverArtUrl, soundClipUrl };
    if (ENABLE_ENRICHMENT) {
      const add = await enrichTrack(payload);
      payload = { ...payload, ...add };
    }

    const track = await Track.create(payload);
    return res.status(201).json(track);
  } catch (err) { next(err); }
};

// GET /tracks - Index
exports.index = async (req, res, next) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    return res.status(200).json(tracks);
  } catch (err) {
    return next(err);
  }
};

// GET /tracks/:id - Show
exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid track id' });

    const track = await Track.findById(id);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    return res.status(200).json(track);
  } catch (err) {
    return next(err);
  }
};

// PUT /tracks/:id - Update
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid track id' });

    const existing = await Track.findById(id);
    if (!existing) return res.status(404).json({ error: 'Track not found' });

    // Build updates from body keys only
    let updates = {};
    ['title','artist','coverArtUrl','soundClipUrl'].forEach(k => {
      if (k in req.body) updates[k] = req.body[k];
    });

    if (ENABLE_ENRICHMENT && (!updates.coverArtUrl || !updates.soundClipUrl)) {
      const add = await enrichTrack({ ...existing.toObject(), ...updates });
      updates = { ...updates, ...add };
    }

    const track = await Track.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return res.status(200).json(track);
  } catch (err) { next(err); }
};

// DELETE /tracks/:id - Delete
exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid track id' });

    const track = await Track.findByIdAndDelete(id);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    // Per spec: respond with the deleted track
    return res.status(200).json(track);
  } catch (err) {
    return next(err);
  }
};
