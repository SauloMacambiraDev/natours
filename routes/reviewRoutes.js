const express = require('express');
const authController = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController')
const reviewRouter = express.Router({ mergeParams: true })


// reviewController.store examples of possibles URL granted from mergeParams: true Router option
// POST /tour/213f1234asdf/reviews
// POST /reviews

reviewRouter.use(authController.protect)

reviewRouter
  .route('/')
  .get(reviewController.index)
  .post(reviewController.setTourUserIDs, reviewController.store)


reviewRouter
  .route('/:id')
  .get(reviewController.show)
  // .patch(reviewController.updateReview)
  .patch(authController.restrictTo('user', 'admin'), reviewController.update)
  .delete(authController.restrictTo('user', 'admin'), reviewController.destroy)

// module.exports = (app) => {
//   app.use('/api/v1/reviews', reviewRouter)
// }
module.exports = reviewRouter
