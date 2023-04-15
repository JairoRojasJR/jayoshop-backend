const express = require('express')
const router = express.Router()
const { getImage } = require('../../controllers/stream')

router.get('/image/*', getImage)

module.exports = router
