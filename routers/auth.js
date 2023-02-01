const express = require('express');
const router = express.Router();
const {
  getIsAuth,
  loginAdmin,
  logoutAdmin,
} = require('../controllers/authController');

router.get('/admin/login', getIsAuth);
router.post('/admin/login', loginAdmin);
router.get('/admin/logout', logoutAdmin);

module.exports = router;
