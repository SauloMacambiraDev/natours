const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const Point2DSchema = require('./point2DSchema.js')
// const User = require('./userModel.js')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal than 40 characters'],
    minlength: [10, 'A tour name must have more or equal than 10 characters'],
    // validate: [validator.isAlpha, 'A tour name must only contain characters']
  },
  slug: String,
  duration: {
    type: Number,
    require: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a Max Group Size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult', 'Really difficult'],
      message: 'Difficulty is either easy, medium, difficult and Really difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'], //also work with dates
    max: [5, 'Rating must be below 5.0'], //also work with dates
    set: val => Math.round(val * 10) / 10 //We multiply for 10 because Math.round will round to integer. So this is why we divide it later, converting to Float Number again.
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: { // ONLY WORKS WHEN CREATING DOCUMENT, NOT UPDATING
      validator: function (val) { // Custom validation
        //because the this reference points to the current document.
        // Arrow function could be used if we didn't use the 'this' reference
        return (val < this.price)
      },
      message: 'Discount price ({VALUE}) should be below regular price' //({VALUE}) references the value of the document's property -> Note: this ({VALUE}) is from MONGOOSE, not from Javascript
    }
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a description'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a Cover Image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
    // select: false basically disable createdAt of being showed when the API is called - SAFE MEASURES TO SENSITIVY DATA
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  premium: {
    type: Boolean,
    default: false
  },
  startLocation: Point2DSchema, //passing the Schema we've made
  locations: [Point2DSchema], // GeoJson -> Passing an Object instead of SchemaOption
  // guides: Array embeddedWay -> Accepts any type of Array
  guides: [
    {
      type: mongoose.Schema.ObjectId, //Reference objectID from mongoose
      ref: 'User' //Name of model we're referecing
    }
  ]
  // reviews: [ // Child referencing for a ton of Reviews is not a good practice
  //   {
  //     type: mongoose.Schema.ObjectId,
  //     ref: 'Review'
  //   }
  // ]
}, {
  toJSON: { virtuals: true },
  toObject: { getters: true }
})


// Creating index for column 'price' with ascending order '1' value
// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingsAverage: -1 }) //Creating a Compound key
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation:  '2dsphere'}) //In order to make Geo Spatial query we need this index

// function() is used because this reference the document fetched by any get method to the mongoDb
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
})

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

// DOCUMENT Mongoose MIDDLEWARE: runs before .save() command and .create() command. But not insertMany()
tourSchema.pre('save', function(next){
  // console.log(this)
  this.slug = slugify(this.name, {lower: true})
  next();
})

// tourSchema.pre('save', function(next){
//   console.log('Will save the document..')
//   next()
// })

// tourSchema.post('save', function(doc, next){
//   console.log(doc)
//   next() //not necessary, since post() middleware is the last middleware to be executed
// })


// QUERY Mongoose MIDDLEWARE - hook pre('find') method do not affect findOne() method from mongoose
// tourSchema.pre('find', function(next){
tourSchema.pre(/^find/, function (next) { // all Strings which start with 'find' words
  // this references a query
  this.find({ secretTour: { $ne: true } })
  this.start = Date.now();
  next()
})

tourSchema.post(/^find/, function (docs, next) {
  const timeResult = Date.now() - this.start
  console.log(`Query took ${timeResult} milliseconds!`)
  // console.log(docs)
  next()
})

tourSchema.pre(/^find/, function (next) {
  // this.populate('guides')
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  })

  next()
})

// AGGREGATION PIPELINE Mongoose MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })

//   console.log(this.pipeline())

//   next()
// })
// Using Embedding 1:N relationship on Tours Model
// tourSchema.pre('save', async function (next) {
//   let guidesPromises = this.guides.map(id => User.findById(id))
//   this.guides = await Promise.all(guidesPromises)

//   return next()
// })



// Not a good practice..
// tourSchema.pre('findOne', function(next){
//   this.find({secretTour: { $ne: true } })

// tourSchema.post('aggregate', function (docs, next) {
//   console.log("Docs on post-aggregate")
//   console.log(docs)

//   next()
// })

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour

// exports.addTour = async ({name , rate, price, premium}) => {

//     const newTour = new Tour({
//         name: name,
//         rate: rate,
//         price: price,
//         premium: premium
//     })

//     await newTour.save().then(result => {
//         console.log(`Tour ${name} saved in database!`)
//         console.log(result)
//     }).catch( err => {
//         console.log(`Coudnt save ${name} in database. Reason: ${err}`)
//     })
// }

// exports.updateTour = () => {
//     // Logic to update a specific Tour in database
// }

// exports.getTour = () => {
//     // Logic to get one specific Tour
// }

// exports.getTours = () => {
//     // Logic to get all Tours in database
// }

// exports.deleteTour = ({name}) => {
//     // Logic to deleteTour in database
// }
