const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const asyncCatch = require('./../utils/asyncCatch')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')
const { promisify } = require('util')
const crypto = require('crypto')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN // expiresIn option will add some data to payload
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)), // convert to milliseconds
    httpOnly: true //cookie can't be accessed or modified by any way in the browser
  }

  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true //will only be sent with HTTPs connection

  res.cookie('jwt', token, cookieOptions)

  // remove the password from the Output
  user.password = undefined

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

exports.signup = asyncCatch(async (req, res, next) => {
  // const newUser = await User.create(req.body) -> Dangerows since anyone can set to become admin
  const { fullName, email, password, passwordConfirm, passwordChangedAt, role } = req.body

  const newUser = await User.create({
    name: fullName,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role
  })

  createSendToken(newUser, 201, res)

  // const token = signToken(newUser._id)

  // return res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser
  //   }
  // })
});

exports.login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body

  // 1) Check if email and password actually exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }
  // 2) Check if the user exists && password is correct
  const user = await User.findOne({ email }).select('+password') // + necessary, because it has select:false property

  if (!user || !(await user.correctPassword(password.toString(), user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, res)
  // const token = signToken(user._id)

  // res.status(200).json({
  //   status: 'success',
  //   token
  // })
})

// Middlewares
exports.protect = asyncCatch(async (req, res, next) => {
  let token
  // 1) verify if there is a json web token on request headers
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1]
  } else if(req.cookies.jwt){
    // in case the token is being fetched from Browser and not the API, search for 'jwt' cookie on cookie params
    token = req.cookies.jwt
  }

  if (!token) return next(new AppError(`You are not logged in! Please log in to get access`, 401))

  // 2) Verification token step
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // console.log(decoded)

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) return next(new AppError('The user belonging to this token no longer exists', 401))

  // 4) Check if the user changed password after the token was issued
  if (currentUser.changedPasswordAfterToken(decoded.iat)) { //iat -> issued at
    return next(new AppError('User recently changed password! Please log in again', 401))
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser
  next()
})

exports.restrictTo = (...roles) => { // (...roles) will return an array of function arguments in ES6
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403))
    }

    next()
  }
}

exports.forgotPassword = asyncCatch(async (req, res, next) => {
  //  1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new AppError('There is no user with that email address', 404))
  }

  // 2) generate the random reset token
  const resetToken = user.createPasswordResetToken()
  // await user.save({ validateBeforeSave: false }); not useful here. We need to validate others fields too
  await user.save();

  // 3) Send ir to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message
    })

    return res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save()

    return next(new AppError('there was an error sending the email. Try again later', 500))
  }
})

exports.resetPassword = asyncCatch(async (req, res, next) => {
  // 1) Get user based on the token
  const { resetToken } = req.params
  const { password, passwordConfirm } = req.body

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetToken: { $gt: Date.now() }
  })

  // 2) If Token has not expired, and there is user, set the new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400))

  // 3) Update changedPassword property for the current user
  user.password = password
  user.passwordConfirm = passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // 4) Log the user in, send JWT
  // createSendToken(user, 200, res)
  const token = signToken(user._id)

  return res.status(200).json({
    status: 'success',
    token
  })
})

exports.updatePassword = asyncCatch(async (req, res, next) => {

  const { currentPassword, password, passwordConfirm } = req.body

  if (!currentPassword || !password || !passwordConfirm) {
    return next(new AppError(`Please, provide the password informations`, 400))
  }

  // 1) Get user from collection
  // let authToken

  // const {authorization} = req.headers

  // if(authorization && authorization.startsWith('Bearer')){
  //   authToken = authorization.split(' ')[1]
  // }

  // if(!authToken) return next(new AppError(`Youre not logged in. Please login to access!`, 401));

  // const payload = await promisify(jwt.verify)(authToken, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN
  // })

  const currentUser = await User.findById(req.user._id).select('+password')

  if (!currentUser) return next(new AppError('The user belonging to this token no longer exists', 401))

  // 2) Check if POSTed current password is correct
  if (!(await currentUser.correctPassword(currentPassword.toString(), currentUser.password))) {
    return next(new AppError('The password you have given is not correct. Provide the correct password', 401))
  }

  // 3) If so, update password
  currentUser.password = password
  currentUser.passwordConfirm = passwordConfirm
  currentUser.passwordChangedAt = Date.now()
  await currentUser.save()

  // 4) Log user in, send JWT
  const newToken = signToken(currentUser._id)

  return res.status(200).json({
    status: 'success',
    message: 'Your password has successfully been changed!',
    token: newToken
  })

})

// Only for rendered pages, no errors!
exports.isLoggedIn = asyncCatch(async (req,res,next) => {

  if(req.cookies.jwt){
    // 1) Verify the token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) return next()

    // 3) Check if the user changed password after the token was issued
    if (currentUser.changedPasswordAfterToken(decoded.iat)) { //iat -> issued at
      return next()
    }

    // THERE IS A LOGGED IN USER
    // similar as using res.render('template.hbs', {user: currentUser}), which is, in other words, pass in data
    // into the template

    res.locals.user = currentUser.toObject()
    req.user = currentUser
  }
  return next()
})
