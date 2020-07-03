const addressController = require('../controllers/addressController')
const express = require('express')

const addressRouter = express.Router()

addressRouter
  .route('/')
  .get(addressController.checkIfAddressExist, addressController.getAllAddresses)

addressRouter
  .route('/address-by-state')
  .get(addressController.getAddressByState)

// module.exports = (app) => {
//   app.use('/api/v1/address', addressRouter)
// }

module.exports = addressRouter