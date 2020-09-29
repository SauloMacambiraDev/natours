const crypto = require('crypto') //Native Node Module
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

// schema options
const schemaOptions = {
  toJson: { virtuals: true },
  toObject: { virtuals: true }
}

// The structure of a collection on MongoDB
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'A user must have an e-mail'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'A user must have an e-mail']
  },
  photo: String,
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'A user must have password'],
    minlength: 8,
    trim: true,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have password'],
    trim: true,
    minlength: 8,
    select: false,
    validate: {
      validator: function (value) {
        // if (!this.password){
        //   return true
        // }

        // only works on CREATE or SAVE!!
        return (value === this.password) //-> PROBLEM: this method returns the global variable but not the document itself while UPDATING THE DOCUMENT using the method Model.findByIdAndUpdate()
      },
      message: 'Password confirmation is not the same as password. Please confirm your password.'
    }
  },
  createdAt: {
    type: Date,
    default: new Date().toISOString(),
    select: false
  },
  updatedAt: {
    type: Date,
    select: false
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, schemaOptions)

// Pre Middleware Mongoose
userSchema.pre(/^find/, function (next) {
  // this poins to the current query
  // this.find({ active: true })
  this.find({ active: { $ne: false } })

  return next()
})

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next()
  // hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12)
  // delete the passwordConfirm from being saved in database
  this.passwordConfirm = undefined

  return next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000 //1 seconds in the past than the token has been generated
  next()
})

// Instance method -> Allow each document retrieved from database to use such a method as, for example, a prototype method
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  // 'this' points to the current Document
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfterToken = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // converting to seconds
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    // console.log(changedTimestamp, JWTTimestamp)
    return JWTTimestamp < changedTimestamp // if the date of 'json issued at' payload attribute is higher than the changedTimestamp, it means that the login was made after the user change this password. thus, the user has to log again
  }

  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  console.log({ resetToken }, this.passwordResetToken)

  this.passwordResetExpires = Date.now() + (10 * 60 * 1000) //new Date() * 1000(milisegundos) * 60(segundos) * 10(minutos)

  return resetToken
}

// userSchema.virtual('firstName').get(function () {
//     return this.fullName.split(' ')[0]
// })

// userSchema.virtual('lastName').get(function () {
//     const lastIndex = this.fullName.split(' ').length
//     return this.fullName.split(' ')[lastIndex - 1]
// })

// the this keyword points to the query but no the document
// userSchema.pre('findByIdAndUpdate', function(next){
//   this.updatedAt = new Date().toISOString()
//   return next()
// })

// it creates an virtual 'id' attribute by default
// userSchema.set('toObject', { virtuals: true })
// userSchema.set('toJSON', { virtuals: true })

// userSchema.virtual('emailDomain').get(function () {
//     const emailDomain = this.email.slice(this.email.indexOf('@') + 1)
//     return emailDomain
// })

// userSchema.pre('findByIdAndUpdate', function(next){
//   // this returns the query, not the document
//   if (this.password !== this.passwordConfirm){
//     return next(new AppError('Password confirmation is not the same as password. Please confirm your password', 400))
//   }

//   next()
// })



// with mongoose.model, we are able to make crud operations on MongoDB (manipulate Documents)
const User = mongoose.model('User', userSchema);


module.exports = User;
