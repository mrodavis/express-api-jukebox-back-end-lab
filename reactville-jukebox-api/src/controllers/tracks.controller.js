const mongoose = require('mongoose');
const Track = require('../models/Track');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /tracks - Create
exports.create = async (req, res, next) => {
  try {
    const { title, artist } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: 'title and artist are required' });
    }
    const track = await Track.create({ title, artist });
    return res.status(201).json(track); // 201 Created
  } catch (err) {
    return next(err);
  }
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

    const updates = {};
    if ('title' in req.body)  updates.title  = req.body.title;
    if ('artist' in req.body) updates.artist = req.body.artist;

    const track = await Track.findByIdAndUpdate(id, updates, {
      new: true, runValidators: true
    });
    if (!track) return res.status(404).json({ error: 'Track not found' });

    return res.status(200).json(track);
  } catch (err) {
    return next(err);
  }
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
