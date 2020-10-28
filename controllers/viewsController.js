const Tour = require('./../models/tourModel');
const asyncCatch = require('./../utils/asyncCatch');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');

exports.alerts = (req,res,next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert = `Your booking was successful! Please check your email for a confirmation.
    If your booking doesn't show up here immediatly, please come back later.`;

  }

  return next();
}

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

  // if(!tourDocument) return res.render('tour', { title: 'Not Found' })

  if (!tourDocument) {
    return next(new AppError('There is no tour with that name.', 404))
  }

  const tour = tourDocument.toObject()
  const tourDescriptions = tour.description.split('\n')


  // return res.status(200).render('tour', { title: tour.name, tour, tourDescriptions, jsFile: 'mapbox.js' })
  // Since we are bundling all js files, there is no need to specify the jsFile being used to specific
  // view
  return res.status(200).render('tour', { title: tour.name, tour, tourDescriptions })
})

exports.getLoginForm = asyncCatch( async (req,res,next) => {

  // res.status(200).render('login', {title: 'Log into your account ', jsFile: 'login.js'})
  // Since we are bundling all js files, there is no need to specify the jsFile being used to specific
  // view
  res.status(200).render('login', { title: 'Log into your account ' })
})

exports.getAccount = (req, res) => {
  return res.status(200).render('account', {
    title: 'Account information'
  });
}

exports.getMyTours = asyncCatch(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({
    user: req.user.id
  });


  // 2) Find tours with the returned IDs
  const tourIds = bookings.map(b => b.tour);
  let tours = await Tour.find({
    _id: { $in: tourIds }
  });

  tours = tours.map(tour => tour.toObject());

  return res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
})

// exports.updateUserData = asyncCatch(async (req, res, next) => {
//   const { name, email } = req.body;

//   const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//     name,
//     email
//   }, {
//     new: true,
//     runValidators: true
//   });

//   // return res.redirect('/account');
//   return res.status(200).json({
//     status: 'success',
//     message: 'Data updated successfully!'
//   });
// })

