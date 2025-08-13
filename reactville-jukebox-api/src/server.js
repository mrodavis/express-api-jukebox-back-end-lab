const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const methodOverride = require('method-override');
const morgan = require('morgan');
require('dotenv').config();

const tracksRouter = require('./routes/tracks.routes');

const app = express();

// Middleware
app.use(cors());                       // CORS
app.use(express.json());               // Parse JSON bodies
app.use(methodOverride('_method'));    // Allows ?_method=PUT / DELETE
app.use(morgan('dev'));                // Nice request logs

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Reactville Jukebox API' });
});

// Routes
app.use('/tracks', tracksRouter);

// 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// Boot
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jukebox';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });
