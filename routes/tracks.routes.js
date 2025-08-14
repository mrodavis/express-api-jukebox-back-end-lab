const router = require('express').Router();
const Tracks = require('../controllers/tracks.controller');

// Required routes
router.post('/',  Tracks.create);   // 201
router.get('/',   Tracks.index);    // 200
router.get('/:id',Tracks.show);     // 200
router.put('/:id',Tracks.update);   // 200
router.delete('/:id', Tracks.destroy); // 200

module.exports = router;
