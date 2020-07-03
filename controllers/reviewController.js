const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory')
// const asyncCatch = require('./../utils/asyncCatch');
// const AppError = require('./../utils/appError');


// Middleware
exports.setTourUserIDs = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user._id
  return next()
}

// Route Handlers
exports.index = factory.getAll(Review)

exports.store = factory.createOne(Review)
exports.update = factory.updateOne(Review)
exports.destroy = factory.deleteOne(Review)
exports.show = factory.getOne(Review)

// exports.index = asyncCatch(async (req, res, next) => {
//   let filter = {}
//   if (req.params.tourId) filter = { tour: req.params.tourId }

//   const reviews = await Review.find(filter)

//   return res.status(200).json({
//     message: 'success',
//     results: reviews.length,
//     data: {
//       reviews
//     }
//   })
// })

// exports.show = asyncCatch(async (req, res, next) => {
//   const { id } = req.params
//   const review = await Review.findById(id)

//   return res.status(200).json({
//     message: 'success',
//     data: {
//       review
//     }
//   })
// })

// exports.store = asyncCatch(async (req, res, next) => {
//   if (!req.body.tour) req.body.tour = req.params.tourId
//   if (!req.body.user) req.body.user = req.user._id

//   const { tour, user: author, review, rating } = req.body

//   const reviewObj = {
//     tour,
//     author,
//     review,
//     rating
//   }

//   const newReview = await Review.create(reviewObj)

//   return res.status(201).json({
//     message: 'success',
//     data: {
//       review: newReview
//     }
//   })
// })

// exports.update = asyncCatch(async (req, res, next) => {
//   const { rating, review } = req.body

//   const { id } = req.params

//   let reviewUpdated = await Review.findByIdAndUpdate(id, { rating, review }, {
//     new: true,
//     runValidators: true
//   })

//   return res.status(200).json({
//     message: 'success',
//     data: {
//       review: reviewUpdated
//     }
//   })

// })
