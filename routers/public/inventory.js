const express = require('express')
const router = express.Router()
const { getSections, getProducts } = require('../../controllers/inventory')

router.get('/sections', getSections)
router.get('/products', getProducts)
router.get('/products/:segmentation', getProducts)

module.exports = router
