const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncCatch = require('./../utils/asyncCatch');
const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const factory = require('./handlerFactory');

exports.getCheckoutSession = asyncCatch(async (req,res,next) => {
  // 1) Get the currently booked tour
  const { tourId } = req.params;

  const tour = await Tour.findById(tourId);
  if(!tour) throw new AppError(`Tour with ID: ${tourId} does not exist`, 400);

  // 2) Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      tourId
    }&user=${req.user.id}&price=${tour.price}`, // not secure way of making the checkout form process
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
        amount: tour.price * 100, // amount is expected to be in cents
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  })
})

exports.createBookingCheckout = asyncCatch(async (req,res,next) => {
  // TEMPORARY solution, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  return res.redirect('/');
})

exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking, { path: 'tour', select: 'name slug imageCover ratingsAverage ratingsQuantity price' });
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
