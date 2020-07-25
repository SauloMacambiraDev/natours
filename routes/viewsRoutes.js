const express = require('express')
const router = express.Router()
const viewsController = require('./../controllers/viewsController')
const authController = require('./../controllers/authController')

// Check if user is logged in by reading cookies requests headers
router.use(authController.isLoggedIn)

router.get('/', viewsController.getOverview)

router.get('/tours/:slug', viewsController.getTour)

router.get('/login', viewsController.getLoginForm)

module.exports = router
