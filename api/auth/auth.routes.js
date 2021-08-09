const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const { login, signup, logout, logingoogle } = require('./auth.controller')

const router = express.Router()

router.post('/logingoogle', logingoogle)
router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', requireAuth, logout)
module.exports = router