const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    default: 'Brazil',
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  }
})

const Address = mongoose.model('Address', addressSchema)

module.exports = Address
