const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncCatch = require('./../utils/asyncCatch');
const AppError = require('./../utils/appError');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
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

    // not secure way of making the checkout form process
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   tourId
    // }&user=${req.user.id}&price=${tour.price}`,

    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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

// UNSAFE way of handling successfully checkout sessions from StripeJs - Old Approach (demonstrative only)
// exports.createBookingCheckout = asyncCatch(async (req,res,next) => {
//   // TEMPORARY solution, because it's UNSECURE: everyone can make bookings without paying
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) return next();

//   await Booking.create({ tour, user, price });

//   return res.redirect('/');
// })

const createBookingCheckout = async session => {
  const tour = session['client_reference_id'];
  const user = (await User.findOne({email: session['customer_email']})).id;
  const price = session['amount_total'] / 100;

  await Booking.create({
    tour,
    user,
    price
  });

}

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {

    /**
     * Stripe validate the data tha comes from the req.body (Stream/raw through express.raw() middleware)
     * with the help of two paremeters: the signature that is sent by the webhook created in Stripe's platform
     * and the Stripe Webhook Secret created together with the webhook.
     *
     * constructEvent -> Create an Event with the session data
     */
    event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
  } catch(err) {
    // Stripe itself will receive that response. Since only the webhook from Stripe will call that endpoint
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if(event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object); // event.data.object == Checkout Session created on middleware 'getCheckoutSession'
  }

  return res.status(200).json({
    received: true
  });
};

exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking, { path: 'tour', select: 'name slug imageCover ratingsAverage ratingsQuantity price' });
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
