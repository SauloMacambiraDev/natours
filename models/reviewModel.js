const mongoose = require('mongoose')
const Tour = require('./tourModel')

// review, rating, createdAt, ref to tour, ref to user
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty'],
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now, // store the timestamp of the current data/hour
    select: false
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a Tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a User']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Allows only one review per Tour x User by creating that compound index
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, async function (next) {

  this.populate({
    path: 'user',
    select: 'name photo' // only the necessary data, right?
  })

  // this.populate({
  //   path:'user',
  //   select: 'name photo' // only the necessary data, right?
  // }).populate({
  //   path: 'tour',
  //   select: 'name'
  // })

  return next()
})

// We use statics() method here because of the 'this' keyword (which will point to Review model)
reviewSchema.statics.calcAverageRatings = async function(tourId){
    // 'this' keyword points to the current Model (Review)
    const stats = await this.aggregate([
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating'}
        }
      }
    ])

    // console.log(stats)
    if(stats.length > 0){
      // [ { _id: 5e723cb7a1a268389430aa1a, nRating: 4, avgRating: 3.125 } ]
      const { nRating: ratingsQuantity, avgRating: ratingsAverage } = stats[0]


      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity,
        ratingsAverage
      }, { runValidators: true })
    } else {

      // Default value for a created Tour
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      }, { runValidators: true })
    }

}

reviewSchema.post('save', function(){
  // 'this' points to the current review

  // 'constructor' is a reference to the Model whose makes possible to all sort of CRUD actions
  this.constructor.calcAverageRatings(this.tour)

  // That way is not possible for two reasons:
  // 1) At the line of code, Review model wasn't created yet. So, when we call Review.calcAverageRatings, the 'Review' will undefined
  // 2) If we put this mongoose middleware after declare the model, it woudn't be configured with that middleware following the hierarchy pattern from NodeJs of reading files from top to bottom..
  // Review.calcAverageRatings(this.tour)

})

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){

  this.reviewFound = await this.findOne()
  // console.log(this.reviewFound)

  return next()
})

reviewSchema.post(/^findOneAnd/, async function(){
  const {tour: tourId } = this.reviewFound
  // await this.findOne(); does NOT work here, query has already executed
  await this.reviewFound.constructor.calcAverageRatings(tourId)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
