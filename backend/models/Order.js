const mongoose=require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    drone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drone'
    },
    pickupLocation: {
        type: String,
        required: true
    },
    pickupLat: {
        type: Number,
        default: 25.5941
    },
    pickupLng: {
      type: Number,
      default: 85.1376
    },
    dropLocation: {
        type: String,
        required: true
    },
    payloadWeight: {
      type: Number,
      required: true,
      min: 0.1
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'on the way', 'delivered', 'cancelled'],
        default: 'pending'
    },
    description: {
        type: String
    }
}, { timeStamps: true});

module.exports = mongoose.model('Order', orderSchema);