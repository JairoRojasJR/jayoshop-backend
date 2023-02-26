const express = require('express');
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} = require('../controllers/adminController');
const isAuth = require('../middlewares/isAuth');
const router = express.Router();

router.get('/inventario', isAuth, getProducts);
router.post('/inventario', isAuth, addProduct);
router.put('/inventario', isAuth, updateProduct);
router.delete('/inventario', isAuth, deleteProduct);

module.exports = router;
