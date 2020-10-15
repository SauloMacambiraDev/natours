const fs = require('fs');
const Tour = require('../models/tourModel')

// Top Level blocking level - only load once
// let tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// Middleware
exports.checkBodyMiddleware = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !price) {
    // console.log('Request post body not valid');
    return res.status(400).json({
      status: 'failure',
      message: `Invalid request body to create a tour. `
    });
  }

  next();
};

exports.checkID = async (req, res, next, val) => {
  // console.log(`Tour id is: ${val}`)
  const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, { encoding: 'utf-8' }))

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'failure',
      message: 'Invalid ID'
    })
  }

  next();
}

exports.aliasTopTours = async (req, res, next) => {
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
}

// Route Handlers

// GET tours
exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY

    // console.log(JSON.stringify(req.tours))

    let queryObj = { ...req.query }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach(field => delete queryObj[field])

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|le|lte)\b/g, match => `$${match}`)
    // console.log(JSON.parse(queryStr))

    // Object filtering notation on mongoose -> No need for await shortcut, we only pick up the Query object
    // const query = Tour.find(queryObj)

    let query = Tour.find(JSON.parse(queryStr))

    // 2) Sorting
    // Obs.: api/v1/tours?sort=price,ratingsAverage will be splited and joined to become sort: 'price ratingsAverage' in asceding order
    // api/v1/tours?sort=-price,-ratingsAverage, mongoose will bring data in desceding order
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      // console.log(`Sorted with params: ${sortBy}`)
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields) // Ex.: query = query.select('name duration price')
    } else {
      query = query.select('-__v') // using '-' on select() exclude the specific item passed as params on projection
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1 // * 1 convert String to Number
    const limit = req.query.limit * 1 || 100
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit) // page=3&limit=10, 1-10->page 1, 11-20->page 2, 21-30->page 3
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist')
    }

    // EXECUTE QUERY
    const tours = await query // Example of the final query: query.sort(req.query.sort).select(req.query.fields.split(',').join(' ')).skip(((req.query.page - 1) * 10)).limit(req.query.limit)

    // Just like i have seen in mongo shell, db.tours.find() returns all documents in Tours HTMLAllCollection
    // Tour.find() does the same
    // const tours = await Tour.find()

    return res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    })

    // mongose filtering methods notation
    // const tours = await Tour.find()
    // .where('duration').equals(5)
    // .where('difficulty').equals('easy')
  } catch (err) {

    return res.status(404).json({
      status: 'failure',
      message: err
    })
  }
};

exports.createTour = async (req, res) => {
  try {
    // const { name, rate, price, premium } = req.body
    // // befor, we did like..
    // const newTour = new Tour({
    //   name: name,
    //   rate: rate,
    //   price: price,
    //   premium: premium
    // })
    // newTour.save().then( result => console.log()).catch(err => console.log())

    // Returns the entire document that were saved in database if no error were found
    const newTour = await Tour.create(req.body)

    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })

  } catch (error) {
    res.status(400).json({
      status: 'failure',
      message: 'Invalid data sent!'
    })
  }
};

// DELETE tour
exports.deleteTour = async (req, res) => {

  try {
    const { id } = req.params;
    await Tour.findByIdAndDelete(id)

    res.status(204).json({
      status: 'success',
      data: null
    })

  } catch (err) {
    return res.status(404).json({
      status: 'failure',
      message: err
    })
  }



  // Some logic here to remove the tour passed through the query string (req.params)
  // res.status(204).json({
  //   status: 'success',
  //   data: null
  // });
};

// Tour PATCH
exports.updateTour = async (req, res) => {
  try {
    // the third argument: { new: true} indicates mongoose to return the document updated, rather than the original
    // { runValidators: true } run again the schema's validators to check if the data passing as the second argument
    //follow the prefixed rules in tourSchema
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    return res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (err) {
    return res.status(400).json({
      status: 'failure',
      message: err
    })
  }
};

// GET Tour (:id)
exports.getTour = async (req, res) => {
  try {
    // same as : Tour.findOne({_id: req.params.id })
    const tour = await Tour.findById(req.params.id)
    // const tour = await Tour.findOne({_id: req.params.id})

    return res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (err) {
    return res.status(404).json({
      status: 'failure',
      message: err
    })
  }
};
