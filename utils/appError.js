// ES6 class inheritance
class AppError extends Error {
  constructor(message, statusCode){
    super(message) //the only parameter that Error class accepts in its constructor= Calling new Error(message)
    this.statusCode = statusCode
    this.status = `${this.statusCode}`.startsWith('4') ? 'failure' : 'error'
    this.isOperationalError = true

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
