const path = require('path')
const express = require('express');
const app = express();
// const printRequestInfo = require('./utils/requestsUtil');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const hbs = require('express-handlebars')
const hbsHelpers = require('./utils/hbsHelpers')
const cookieParser = require('cookie-parser')
// const fs = require('fs');

// Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const addressRouter = require('./routes/addressRoutes');
const viewsRouter = require('./routes/viewsRoutes');


// We need to install express-handlebars which is the lib for HandlebarsJs Engine
app.engine('.hbs', hbs({
  layoutsDir: path.resolve(__dirname, 'views', 'layouts'),
  partialsDir: path.resolve(__dirname, 'views', 'partials'),
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: hbsHelpers
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))
app.disable('view cache');

// MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// 1) Set security HTTP headers
app.use(helmet())

// 2) Limit requests from same API
const limiter = rateLimit({
  max: 100, //max requests
  windowMs: 60 * 60 * 1000, //Interval of 1h per 100 requests
  message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)
// Body parser, reading data from body into req.body
app.use(express.json());
app.use(cookieParser()); // parse data from the cookies
// app.use(express.json({ limit: '10kb'})); only json requests on body with 10kb maximum

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())
// Data sanitization against XSS - Cross-site Script attacks
app.use(xss())
// Prevent parameter polution
app.use(hpp({
  whitelist: [ //allow duplicate params in query String
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))

const nodeEnv = process.env.NODE_ENV

console.log(`NODE ENV --> ${nodeEnv}`);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

if (process.env.NODE_ENV === 'development'){
  app.use((req, res, next) => {

    //   printRequestInfo(req);
    req.requestTime = new Date().toISOString();
    method = req.method;
    endpoint = req.url
    console.log(`${method} ${endpoint} - Request datetime(UTC) = ${req.requestTime}`);
    console.log(req.cookies)

    //   If we didn't call the next() function, the request response cycle would be stuck at this point.
    //   it woudn't be able to move on, and would never send a response to the client
    //   so.. NEVER FORGET TO USE NEXT() FUNCTION IN MIDDLEWARES!
    next();
  });

}

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/addresses', addressRouter)
app.use(viewsRouter)
// require('./routes/index')(app)



const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

app.all('*', (req, res, next) => {
  // whenever we pass an argumento to the next() function, express automatically will know that we are passing an error to every single middleware next to it. It'll skip every middle until it drop into the Global Error Handling Middleware
  next(new AppError(`Can't find the URL ${req.url} on this server`, 404))
})

// Error handling middleware
app.use(globalErrorHandler)


module.exports = app;
