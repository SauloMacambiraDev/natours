const Address = require('../models/addressModel')

// MIDDLEWARES
exports.checkIfAddressExist = async (req, res, next) => {
  try {

    queryOptions = Object.keys(req.query)
    if (queryOptions.length > 0) {
      queryOptions.forEach(option => {
        if (!(option === 'country' || option === 'state' || option === 'city')) {
          // not allowed to pass
          throw new Error('Option not allowed to fetch address')
        }
      })
    }

  } catch (err) {
    // console.log('Error while trying to check if address exists')
    // console.log(err)

    return res.status(404).json({
      status: 'failure',
      message: `That address doesn't exist`
    })
  }

  next();
}

// ROUTE HANDLERS
exports.getAllAddresses = async (req, res) => {

  try {
    // console.log('Query string to get All addresses:')
    // console.log(req.query)
    const addresses = await Address.find(req.query).sort('state');

    return res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: {
        addresses
      }
    })
  } catch (err) {
    // console.log('Error while trying to fetch address, reason:')
    // console.log(err)
    res.status(404).json({
      status: 'failure',
      message: 'Address not found'
    })
  }
}

exports.getAddressByState = async (req, res) => {
  try {

    const addresses = await Address.aggregate([
      {
        $match: { country: 'Brazil' }
      },
      {
        $group: {
          _id: '$state',
          numCities: { $sum: 1 },
          cities: { $push: '$city' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    return res.status(200).json({
      status: 'success',
      data: {
        addresses
      }
    })
  } catch (err) {
    // console.log('Error while trying to fetch address by STATE, reason:')
    // console.log(err)
    res.status(404).json({
      status: 'failure',
      message: err
    })
  }
}
