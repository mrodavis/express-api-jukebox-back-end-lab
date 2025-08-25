const express = require('express');
const mongoose = require('mongoose');
const Track = require('../models/Track');
const { enrichTrack } = require('../services/music.service');

const ENABLE_ENRICHMENT = process.env.ENABLE_ENRICHMENT !== 'false';
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- Handlers (controller methods) ---
async function create(req, res, next) {
  try {
    const { title, artist, coverArtUrl, soundClipUrl } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: 'title and artist are required' });
    }

    let payload = { title, artist, coverArtUrl, soundClipUrl };

    if (ENABLE_ENRICHMENT) {
      const add = await enrichTrack(payload);
      payload = { ...payload, ...add };
    }

    const track = await Track.create(payload);
    return res.status(201).json(track);
  } catch (err) {
    next(err);
  }
}

async function index(req, res, next) {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    return res.status(200).json(tracks);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid track id' });
    }

    const track = await Track.findById(id);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    return res.status(200).json(track);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid track id' });
    }

    const existing = await Track.findById(id);
    if (!existing) return res.status(404).json({ error: 'Track not found' });

    // Only allow known fields to be updated
    const allowed = ['title', 'artist', 'coverArtUrl', 'soundClipUrl'];
    let updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];

    if (ENABLE_ENRICHMENT && (!updates.coverArtUrl || !updates.soundClipUrl)) {
      const add = await enrichTrack({ ...existing.toObject(), ...updates });
      updates = { ...updates, ...add };
    }

    const track = await Track.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(track);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid track id' });
    }

    const track = await Track.findByIdAndDelete(id);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    return res.status(200).json(track);
  } catch (err) {
    next(err);
  }
}

// --- Optional: local router owned by the controller ---
// This lets you keep “controllers-only” organization while still
// providing a single export that can be mounted in app.js.
const router = express.Router();
router.post('/', create);        // 201
router.get('/', index);          // 200
router.get('/:id', show);        // 200
router.put('/:id', update);      // 200
router.delete('/:id', destroy);  // 200

// Convenience helper if you prefer attaching directly to the app:
function mount(app, basePath = '/tracks') {
  app.use(basePath, router);
}

// Export controller API
module.exports = {
  // handlers
  create,
  index,
  show,
  update,
  destroy,
  // optional router + mount
  router,
  mount,
};
