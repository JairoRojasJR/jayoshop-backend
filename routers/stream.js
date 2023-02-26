const express = require('express');
const { getImage } = require('../controllers/streamController');
const router = express.Router();

router.get('/image/:id', getImage);

module.exports = router;
