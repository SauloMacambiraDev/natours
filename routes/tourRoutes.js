const tourController = require('../controllers/tourController');
const express = require('express');
const authController = require('./../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes')
// const reviewController = require('./../controllers/reviewController')

const tourRouter = express.Router();

// router.param('id', tourController.checkId);

//Create a checkBody middleware
// Check if body contains the name and price property
// if not, send back 400 status code (bad request)
// add to the post handler stack

// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('admin', 'user'), reviewController.store)

tourRouter.use('/:tourId/reviews', reviewRouter)

tourRouter
  .route('/tour-stats')
  .get(tourController.getTourStats)

tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  )

tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours)


tourRouter
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin)
    // /tours-within?distance=233&center=-40,45&unit=mi
    // /tours-within/233/center/-40,45/unit/mi

tourRouter.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)


tourRouter
  // .param(tourController.checkID)
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)
// .post(tourController.checkBodyMiddleware, tourController.createTour);


// module.exports = (app) => {
//   app.use('/api/v1/tours', tourRouter)
// }

module.exports = tourRouter
