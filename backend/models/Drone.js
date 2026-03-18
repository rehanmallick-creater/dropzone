const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    status: {
        type: String,
        enum: ['available', 'assigned', 'on the way', 'charging'],
        default: 'available'
    },
    battery: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    latitude: {
        type: Number,
        default: 25.5941
    },
    longitude: {
        type: Number,
        default: 85.1376
    }
}, { timestamps: true});

module.exports = mongoose.model('Drone', droneSchema);