const express = require('express');
const { getProducts, addProduct } = require('../controllers/adminController');
const isAuth = require('../middlewares/isAuth');
const router = express.Router();

router.get('/inventario', isAuth, getProducts);
router.post('/inventario', isAuth, addProduct);

module.exports = router;
