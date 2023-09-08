const express = require('express')
const router = express.Router()
const isAuth = require('../../middlewares/checkAuth')
const {
  addSection,
  updateSection,
  deleteSection
} = require('../../controllers/admin/sections')
const {
  addProduct,
  deleteProduct,
  updateProduct,
  productSeller
} = require('../../controllers/admin/products')

router.post('/inventory/sections', isAuth, addSection)
router.delete('/inventory/sections', isAuth, deleteSection)
router.put('/inventory/sections', isAuth, updateSection)

router.post('/inventory/products', isAuth, addProduct)
router.put('/inventory/products', isAuth, updateProduct)
router.delete('/inventory/products', isAuth, deleteProduct)

router.put('/inventory/seller', isAuth, productSeller)

module.exports = router
