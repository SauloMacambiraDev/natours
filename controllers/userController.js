const User = require('./../models/userModel');
const asyncCatch = require('./../utils/asyncCatch')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')

// Utility function
const filterObj = (obj, ...allowedFields) => {
  let newObj = {}
  Object.keys(obj).forEach(element => {
    if (allowedFields.includes(element)) newObj[element] = obj[element]
  })

  return newObj
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id
  return next()
}

//Users Routes handling

exports.index = factory.getAll(User)
// exports.index = asyncCatch(async (req, res, next) => {
//   let query = User.find()

//   //Filtering users
//   let reqQueryClone = { ...req.query }
//   const excludedFields = ['page', 'sort', 'limit', 'fields']
//   excludedFields.forEach(field => delete reqQueryClone[field])

//   let queryJson = JSON.stringify(reqQueryClone)
//   queryJson = queryJson.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`)
//   reqQueryClone = JSON.parse(queryJson)

//   query = query.find(reqQueryClone)

//   // Sorting users
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ')
//     query = query.sort(sortBy)
//   } else {

//     query = query.sort('fullName')
//   }

//   //Paginating users
//   const page = req.query.page * 1 || 1
//   const limit = req.query.limit * 1 || 20
//   const skip = (page - 1) * limit

//   query = query.skip(skip).limit(limit)

//   // Projecting only a few fields from users. _id always comes
//   query = query.select('fullName email createdAt passwordResetToken')

//   const users = await query

//   return res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users
//     }
//   })

// })

exports.store = asyncCatch(async (req, res, next) => {

  const newUser = await User.create(req.body)

  return res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  })
})



exports.show = asyncCatch(async (req, res, next) => {
  const { id } = req.params
  const user = await User.findById(id)

  if (!user) {
    const message = process.env.NODE_ENV === 'development' ? `User with ID ${id} wasn't found` : `Not possible to see this user`
    return next(new AppError(message, 404))
  }

  return res.status(200).json({
    status: 'success',
    data: {
      user
    }
  })
})

exports.destroy = factory.deleteOne(User)

// exports.destroy = asyncCatch(async (req, res, next) => {
//   const { id } = req.params
//   const user = await User.findByIdAndDelete(id)

//   if (!user) {
//     const message = process.env === 'development' ? `No user with ID ${id} was found` : `Can't delete that specified user`

//     return next(new AppError(message, 404))
//   }

//   return res.status(204).json({
//     status: 'success',
//     data: null
//   })

// })

// Simple update name and email 
exports.defaultUpdate = asyncCatch(async (req, res, next) => {

  // 1) Check if fullName and email was given in the request body
  if (!req.body.fullName || !req.body.email) return next(new AppError('Please, provide email and full name to update your profile', 400))

  // 2) Check if the passed email already exist in database
  // const userAlreadyExist = await User.findOne({ email: req.body.email })
  // if (userAlreadyExist) return next(new AppError('The email you provided is already in use. Please, choose another one', 400))

  // 3) Format data to update the user and send the response to the Client
  const data = filterObj(req.body, 'fullName', 'email')

  const updatedUser = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    message: 'success',
    data: {
      user: updatedUser
    }
  })
})

exports.deleteCurrentUser = asyncCatch(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null
  })
})

// OLD METHOD

// exports.getAllUsers = async (req, res) => {
//     try {

//         const queryObj = { ...req.query }
//         const excludedFields = ['page', 'sort', 'limit', 'fields']
//         excludedFields.forEach(field => delete queryObj[field])

//         const queryUsers = User.find();

//         const users = await queryUsers

//         return res.status(200).json({
//             status: 'success',
//             results: users.length,
//             data: {
//                 users
//             }
//         })

//     } catch (err) {
//         return res.status(404).json({
//             status: 'failure',
//             message: err
//         })
//     }
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please use /signup instead'
  })
}

exports.getUser = factory.getOne(User)

// exports.getUser = async (req, res) => {
//     try {

//         const { id } = req.params
//         const user = User.find(id)
//         // same thing as:
//         // const user = User.findOne({ _id: id })

//         return res.status(200).json({
//             status: 'success',
//             data: {
//                 user
//             }
//         })
//     } catch (err) {
//         return res.status(404).json({
//             status: 'failure',
//             message: `User with id ${id} coudn't be found`
//         })
//     }
// };


// exports.deleteUser = asyncCatch(async (req, res) => {
//   const { id } = req.params
//   await User.findByIdAndDelete(id)
//   res.status(204).json({
//     status: 'success',
//     data: null
//   })
// });

// exports.createUser = async (req, res) => {
//     try {

//         const newUser = User.create(req.body);

//         // or you could use prototype methods from a instance of a module
//         // const { fullName, cpf, gender } = req.body
//         // const newUser = new User({
//         //     fullName: fullName,
//         //     cpf: cpf,
//         //     gender: gender
//         // })
//         // await newUser.save()

//         return res.status(200).json({
//             status: 'success',
//             data: {
//                 user: newUser
//             }
//         })
//     } catch (err) {
//         console.log(err)
//         return res.status(400).json({
//             status: 'Failure',
//             message: 'Invalid data sent'
//         })
//     }
// };

exports.update = factory.updateOne(User)
// exports.updateUser = async (req, res) => {
//     try {

//         const { id } = req.params
//         const user = await User.findByIdAndUpdate(id, req.body, {
//             new: true,
//             runValidators: true
//         })

//         return res.status(200).json({
//             status: 'success',
//             data: {
//                 user
//             }
//         })

//     } catch (err) {
//         return res.status(404).json({
//             status: 'failure',
//             message: `User with ID ${req.params.id} coudn't be found in database`
//         })
//     }
// };
