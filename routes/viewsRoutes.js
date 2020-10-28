const express = require('express');
const router = express.Router();
const viewsController = require('./../controllers/viewsController');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const Email = require('./../utils/email');
const User = require('./../models/userModel');
// Check if user is logged in by reading cookies requests headers
// router.use(authController.isLoggedIn)

router.use(viewsController.alerts);

router.get(
            '/',
            authController.isLoggedIn,
            // bookingController.createBookingCheckout, -> Old (unsafe) approach
            viewsController.getOverview);
router.get('/tours/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/account', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
// router.patch('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router
