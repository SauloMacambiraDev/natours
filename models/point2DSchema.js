const mongoose = require('mongoose')

const Point2DSchema = new mongoose.Schema({ //GeoJSON on MongodDB 
    type: {
        type: String,
        default: 'Point',
        enum: ['Point']
    },
    coordinates: [Number], // latitude and longitude
    address: String,
    description: String,
    day: Number
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

module.exports = Point2DSchema