const Tour = require('./../models/tourModel')
const asyncCatch = require('./../utils/asyncCatch')

exports.getOverview = asyncCatch(async (req, res, next) => {
  // 1) Get tour data from collection
  const documents = await Tour.find();
  // Convert Model class type to Js Object type using method .toObject()
  const tours = documents.map(t => t.toObject())
  // 2) Build Template
  // 3) Render template using tour data from step 1)
  return res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
})

exports.getTour = asyncCatch(async (req,res,next) => {
  const { slug } = req.params

  // 1) Get the data, for the request tour (including reviews and guides)
  const tourDocument = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  })

  if(!tourDocument) return res.render('tour', {title: 'Not Found'})

  const tour = tourDocument.toObject()
  const tourDescriptions = tour.description.split('\n')


  return res.render('tour', { title: tour.name, tour, tourDescriptions })
})
