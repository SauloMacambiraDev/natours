const AppError = require('./../utils/appError')

// handler errors
const handleValidationErrorDB = err => {

  const errors = Object.values(err.errors).map(el => el.message)
  console.log('Errors by validation:')
  console.log(errors)

  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  duplicatedKey = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  console.log('Duplicated key: ')
  console.log(duplicatedKey)

  const message = `Duplicated field value: ${duplicatedKey}. Please, use another value!`
  return new AppError(message, 400)
}

const handleCastErrorDb = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token Please log in again!', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again', 401)

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err, res) => {
  if (err.isOperationalError){

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else { // Programming or other unknown error: don't leak error details

    // 1) Log error
    console.log('Error, ', err)

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Internal error server'
    })
  }
}

module.exports = (err, req, res, next) => {
  // console.log(err.stack) // shows where the error happens
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV.trim() === 'production'){
    // let error = { ...err } // the spread operator will only take the newly AppError class properties. The inherited property 'message' is not affected by this command
    let error = Object.create(err) // resolves the problem

    if(err.name === 'CastError') error = handleCastErrorDb(err)
    if(err.name === 'ValidationError') error = handleValidationErrorDB(err)
    if(err.code === 11000) error = handleDuplicateFieldsDB(err)
    if(err.name === 'JsonWebTokenError') error = handleJWTError()
    if(err.name === 'TokenExpiredError') error = handleJWTExpiredError()

    sendErrorProd(error, res)
  } else {
    sendErrorDev(err, res)
  }
}
