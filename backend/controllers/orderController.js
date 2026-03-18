const Order = require('../models/Order');
const Drone = require('../models/Drone');


//  Allowed status transitions
const allowedTransitions = {
  pending: ['assigned'],
  assigned: ['on the way'],
  'on the way': ['delivered'],
  delivered: [],
  cancelled: []
};


//  GET ALL ORDERS (ADMIN)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('drone', 'name status');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  CREATE ORDER (USER)
exports.createOrder = async (req, res) => {
  try {
    const { pickupLocation, dropLocation, description } = req.body;

    if (!pickupLocation || !dropLocation) {
      return res.status(400).json({ message: 'Locations are required' });
    }

    // Find nearest drone
    const drone = await assignNearestDrone(pickupLocation);

    if (!drone) {
     return res.status(400).json({
       message: 'No available drones nearby'
      });
   }

   // mark drone as assigned
   drone.status = 'assigned';
   await drone.save();

   // create order with assigned drone
   const order = await Order.create({
     user: req.user.id,
     pickupLocation,
     dropLocation,
     description,
     drone: drone._id,
     status: 'assigned'
   });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  AUTO ASSIGN NEAREST DRONE
const assignNearestDrone = async (pickupLocation) => {
  const drones = await Drone.find({ status: 'available' });

  if (!drones.length) return null;

  let nearestDrone = null;
  let minDistance = Infinity;

  for (let drone of drones) {
    // skip low battery drones
    if (drone.battery < 30) continue;

    const distance = Math.sqrt(
      Math.pow(drone.latitude - pickupLocation.latitude, 2) +
      Math.pow(drone.longitude - pickupLocation.longitude, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestDrone = drone;
    }
  }

  return nearestDrone;
};
//  UPDATE ORDER STATUS (ADMIN)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check valid transition
    if (!allowedTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    //  ASSIGN DRONE
    
    if (status === 'assigned') {
      return res.status(400).json({
        message: 'Drone is assigned automatically during order creation'
      });
    }
    //  DRONE MOVING
    if (status === 'on the way') {
      if (!order.drone) {
        return res.status(400).json({ message: 'No drone assigned' });
      }

      await Drone.findByIdAndUpdate(order.drone, { status: 'on the way' });
    }

    //  DELIVERY COMPLETE / CANCEL
    if (status === 'delivered' || status === 'cancelled') {
      if (order.drone) {
        await Drone.findByIdAndUpdate(order.drone, { status: 'available' });
      }
    }

    //  UPDATE ORDER STATUS
    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('drone', 'name status');

    res.status(200).json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET USER ORDERS
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('drone', 'name status');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};