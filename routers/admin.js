const express = require('express');
const {
  addProduct,
  getProducts,
  deleteProducts,
  updateProducts,
} = require('../controllers/adminController');
const isAuth = require('../middlewares/isAuth');
const router = express.Router();

router.get('/inventario', isAuth, getProducts);
router.post('/inventario', isAuth, addProduct);
router.put('/inventario', isAuth, updateProducts);
router.delete('/inventario', isAuth, deleteProducts);

module.exports = router;
