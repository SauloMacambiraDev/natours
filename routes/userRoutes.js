const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const express = require('express');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup)
userRouter.post('/login', authController.login)
userRouter.get('/logout', authController.logout)
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:resetToken', authController.resetPassword);

// Will protect all routers that come after this point.
//Middlewares work in sequence.. so everything that comes after here will be hitted by this middleware first
userRouter.use(authController.protect);

userRouter.get('/myProfile', userController.getMe, userController.show);
userRouter.patch('/updatePassword', authController.updatePassword);

// upload.single('photo') -> multer object which accepts one file (single) and are receiving
// through the multipart form data the key 'photo'
userRouter.patch(
                  '/updateProfile',
                  userController.uploadUserPhoto,
                  userController.resizeUserPhoto,
                  userController.defaultUpdate
                );
userRouter.delete('/deactivateUser', userController.deleteCurrentUser);

// Will protect all routers from all users but 'admin' after this point
userRouter.use(authController.restrictTo('admin'));

userRouter
  .route('/:id')
  .get(userController.show)
  .patch(userController.update) //DONT USE TO UPDATE PASSWORD
  .delete(userController.destroy);

userRouter
  .route('/')
  .get(userController.index)
  .post(userController.store);

// module.exports = (app) => {
//   app.use('/api/v1/users', userRouter)
// };

module.exports = userRouter
