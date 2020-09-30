const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const asyncCatch = require('./../utils/asyncCatch');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

// Check if the uploaded file is an Image
const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null, true);
  } else {
    cb(new AppError(`Not an image! Please upload only images.`, 400), false);
  }
}

// dest: path where we want to store image through multipart form requests
// const upload = multer({ dest: `public/image/users` });
// if multer is called without any diskStorage option, the file will be stored in buffer, not in the disk
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// upload.single('photo'); (x) Single image and reproduce req.file
// upload.array('images', 5); (x) Array of images - accepting 5 max count and reproduce req.files
// upload.fields([]) Control the files that are being uploaded and reproduce req.files
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 }, // maxCount says that only one field will have name 'imageCover' to be processed
  { name: 'images', maxCount: 3 }
]); // (v) multiple images

exports.resizeTourImages = asyncCatch(async (req, res, next) => {
  if(!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // Process imageCover and images fields coming from uploadTourImages middleware and store on disk
  await sharp(req.files.imageCover[0].buffer)
          .resize(2000,1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${req.body.imageCover}`)

  req.body.images = [];

  await Promise.all(req.files.images.map(async (file, index) => {
    const fileName= `tour-${req.params.id}-$${Date.now()}-${index + 1}.jpeg`;

    await sharp(file.buffer)
            .resize(2000,1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${fileName}`);
    req.body.images.push(fileName);
  }));

  return next();
});

// Middleware
exports.checkBodyMiddleware = (req, res, next) => {
    const { name, price } = req.body;

    if (!name || !price) {
        console.log('Request post body not valid');
        return res.status(400).json({
            status: 'failure',
            message: `Invalid request body to create a tour. `
        });
    }

    next();
};

exports.checkID = async (req, res, next, val) => {
    console.log(`Tour id is: ${val}`)
    const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, { encoding: 'utf-8' }))

    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'failure',
            message: 'Invalid ID'
        })
    }

    next();
}

exports.aliasTopTours = asyncCatch(async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next();

    // Ideal world? --> Middleware already bring data from database and attach to req.query Object
    // const query = Tour.find()
    // fieldsStr = req.query.fields.split(',').join(' ')
    // sortStr = req.query.sort.split(',').join(' ')
    // query.select(fieldsStr).limit(req.query.limit * 1).sort(sortStr)
    // req.tours = await query
})

// Route Handlers

// GET tours
exports.getAllTours = factory.getAll(Tour)
// exports.getAllTours = asyncCatch(async (req, res, next) => {

//     let query = Tour.find()
//     const features = new APIFeatures(query, req.query)

//     const numTours = await Tour.countDocuments();

//     // 1) Filtering, Sorting, Field Limiting, Paginate
//     query = features.filter().sort().selectFields().paginate(numTours).query

//     // const tours = await query.populate('guides')
//     // const tours = await query.populate({
//     //     path: 'guides',
//     //     select: '-__v -passwordChangedAt'
//     // })
//     const tours = await query

//     return res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours
//         }
//     })
// });


exports.createTour = factory.createOne(Tour)
// exports.createTour = asyncCatch(async (req, res, next) => {
//     // const { name, rate, price, premium } = req.body
//     // // befor, we did like..
//     // const newTour = new Tour({
//     //   name: name,
//     //   rate: rate,
//     //   price: price,
//     //   premium: premium
//     // })
//     // newTour.save().then( result => console.log()).catch(err => console.log())

//     // Returns the entire document that were saved in database if no error were found
//     const newTour = await Tour.create(req.body)

//     return res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour
//         }
//     })
// });

// DELETE tour
exports.deleteTour = factory.deleteOne(Tour)

// exports.deleteTour = asyncCatch(async (req, res, next) => {
//     const { id } = req.params;
//     const tour = await Tour.findByIdAndDelete(id)

//     if (!tour) {
//         return next(new AppError(`No tour was found with ID: ${id}`), 404)
//     }

//     res.status(204).json({
//         status: 'success',
//         data: nuller
//     })
// });

// Tour PATCH
exports.updateTour = factory.updateOne(Tour)
// exports.updateTour = asyncCatch(async (req, res, next) => {

//     // the third argument: { new: true} indicates mongoose to return the document updated, rather than the original
//     // { runValidators: true } run again the schema's validators to check if the data passing as the second argument
//     //follow the prefixed rules in tourSchema
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     })

//     if (!tour) {
//         return next(new AppError(`No tour was found with ID: ${id}`), 404)
//     }

//     return res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
// });

// GET Tour (:id)
exports.getTour = factory.getOne(Tour, { path: 'reviews' })
// exports.getTour = asyncCatch(async (req, res, next) => {
//     // same as : Tour.findOne({_id: req.params.id })
//     // const tour = await Tour.findById(req.params.id).populate('guides')
//     // const tour = await Tour.findById(req.params.id).populate({
//     //     path: 'guides',
//     //     select: '-__v -passwordChangedAt'
//     // })
//     const tour = await Tour.findById(req.params.id).populate('reviews')
//     // const tour = await Tour.findOne({_id: req.params.id})

//     if (!tour) {
//         return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404))
//     }

//     return res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
// })

//_id is null because we want all documents in one group from Tour model
exports.getTourStats = asyncCatch(async (req, res, next) => {

    // aggregate() accepts an array of stages, each stage accept an object
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                // _id: null,
                // _id: '$ratingsAverage',
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 }, //Will sum '1' for each document brought from Tour Collection
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                sumPrice: { $sum: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 } // 1 for ascending
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ])

    return res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
});

exports.getMonthlyPlan = asyncCatch(async (req, res, next) => {

    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates' //deestructure the array of startDates and create a Tour object to each element of the array
        },
        {
            $match: {
                startDates: { //search each document in the query which starts and ends on 2021 value passed on req.params
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' }, //group by startDates, count number of Tours for each startDate, and
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' } // populate an array called 'tours' with all tours inside of each group (picking up only the name attribute)
            }
        },
        {
            $sort: { _id: 1 }
        },
        {
            $addFields: { month: '$_id' } //Add a custom field called month with same value of _id field of query
        },
        {
            $project: { _id: 0 } //Unselect the _id field using projection
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])

    return res.status(200).json({
        status: 'success',
        distinctDates: plan.length,
        data: {
            plan
        }
    });
})

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/300/center/-3.745897, -38.540930/unit/mi
exports.getToursWithin = asyncCatch(async(req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lg] = latlng.split(',')

  // distance / 3963.2 == Radius of the earth in MILES
  // distance / 6378.1 == Radius of the earth in KILOMETERES
  const radius = unit === 'mi' ? distance / 3963.2: distance / 6378.1

  if(!lat || !lg){
    return next(new AppError(`Please provide latitude and longitude in the format 'lat,lng'`, 400))
  }

  // console.log(distance, lat, lg, unit)
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lg, lat],
          radius
        ]
      }
    }
  })

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data:{
      data: tours
    }
  })

})

exports.getDistances = asyncCatch(async (req,res,next) => {
  const { latlng, unit } = req.params

  const [lat, lng ] = latlng.split(',')

  if(!lat || !lng) return next(new AppError(`Please provide latitude and longitude in the format 'lat,lng' in URL Params`, 400))

  // 0.001 for kilometer - samething as dividing by 1000 / 0.000621371 - meter to mile
  const multiplier = unit === 'mi'? 0.000621371 : 0.001

  console.log(`Distances from lat: ${lat}, and longitude: ${lng}`)

  //$geoNear property will use the field startLocation since a 2DSphere index was created to calculate distances using GeoJSON on MongoDb
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project:{
        distance: 1,
        name: 1
      }
    },
    {
      $sort: {
        distance: 1
      }
    }
  ])

  console.log(distances)

  return res.status(200).json({
    status: 'success',
    data:{
      data: distances
    }
  })

})
