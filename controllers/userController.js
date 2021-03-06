const User = require('./../models/userModel');
const asyncCatch = require('./../utils/asyncCatch')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')
const multer = require('multer');
const sharp = require('sharp');

// Configuring  file location, filename and its extension
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, `public/img/users`),
//   filename: (req, file, cb) => {
//     // user-${user_id}-${currentTimeStamp}.${fileExtension}
//     // file ARG - samething that is coming into req.file
//     const ext = file.mimetype.split('/')[1];
//     const fileName = `user-${req.user._id}-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   }
// });

const multerStorage = multer.memoryStorage();

// Check if the uploaded file is an Image
const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image')){
    cb(null, true);
  } else {
    cb(new AppError(`Not an image! Please upload only images.`, 400), false);
  }
}

// dest: path where we want to store image through multipart form requests
// const upload = multer({ dest: `public/image/users` });
// if multer is called without any diskStorage option, the file will be stored in buffer, not in the disk
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = asyncCatch(async (req, res, next) => {
  if(!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  // Better than pass the file as parameter to sharp() searching into file system the right file req.file.filename
  // is better use storage: multer.memoryStorage(), since it stores the file in memory as Buffer (becoming a buffer object).
  await sharp(req.file.buffer)
                      .resize(500, 500)
                      .toFormat('jpeg')
                      .jpeg({ quality: 90 })
                      .toFile(`public/img/users/${req.file.filename}`);

  return next();
});

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
  console.log(req.file);
  console.log(req.body);

  // 1) Check if fullName and email was given in the request body
  if (!req.body.name || !req.body.email) return next(new AppError('Please, provide email and name to update your profile', 400))

  // 2) Format data to update the user and send the response to the Client
  const data = filterObj(req.body, 'name', 'email');

  if(req.file) data.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    message: 'Data has been updated successfully!',
    data: {
      user: updatedUser
    }
  });
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
