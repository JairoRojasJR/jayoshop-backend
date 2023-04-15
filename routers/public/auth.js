const express = require('express')
const router = express.Router()
const checkAuth = require('../../middlewares/checkAuth')
const { getUserData, login, logout } = require('../../controllers/auth')

router.get('/check', checkAuth, getUserData)
router.post('/login', login)
router.get('/logout', logout)

module.exports = router
