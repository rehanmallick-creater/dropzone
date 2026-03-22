const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Drone = require('./models/Drone');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Drone.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data...');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('rehan1234', salt);

    const admin = await User.create({
      name: 'Rehan Alam',
      email: 'rehan@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create regular users
    const user1 = await User.create({
      name: 'Amit Kumar',
      email: 'amit@gmail.com',
      password: await bcrypt.hash('amit1234', salt),
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Priya Singh',
      email: 'priya@gmail.com',
      password: await bcrypt.hash('priya1234', salt),
      role: 'user'
    });

    console.log('Users created...');

    // Create drones
    const drone1 = await Drone.create({
      name: 'Drone Alpha',
      status: 'available',
      battery: 100,
      maxPayload: 10,
      latitude: 25.5941,
      longitude: 85.1376
    });

    const drone2 = await Drone.create({
      name: 'Drone Beta',
      status: 'available',
      battery: 85,
      maxPayload: 15,
      latitude: 25.6097,
      longitude: 85.1263
    });

    const drone3 = await Drone.create({
      name: 'Drone Gamma',
      status: 'available',
      battery: 92,
      maxPayload: 8,
      latitude: 25.6189,
      longitude: 85.0997
    });

    const drone4 = await Drone.create({
      name: 'Drone Delta',
      status: 'charging',
      battery: 45,
      maxPayload: 12,
      latitude: 25.6142,
      longitude: 85.0434
    });

    console.log('Drones created...');

    // Create orders
    await Order.create({
      user: user1._id,
      drone: drone1._id,
      pickupLocation: 'Boring Road, Patna',
      pickupLat: 25.6097,
      pickupLng: 85.1263,
      dropLocation: 'Bailey Road, Patna',
      dropLat: 25.6189,
      dropLng: 85.0997,
      payloadWeight: 2.5,
      status: 'delivered',
      description: 'Medicine package'
    });

    await Order.create({
      user: user2._id,
      drone: drone2._id,
      pickupLocation: 'Patna Junction',
      pickupLat: 25.5941,
      pickupLng: 85.1376,
      dropLocation: 'Kankarbagh, Patna',
      dropLat: 25.5900,
      dropLng: 85.1500,
      payloadWeight: 3.0,
      status: 'delivered',
      description: 'Food delivery'
    });

    await Order.create({
      user: user1._id,
      drone: drone3._id,
      pickupLocation: 'Rajendra Nagar, Patna',
      pickupLat: 25.6020,
      pickupLng: 85.1100,
      dropLocation: 'Gardanibagh, Patna',
      dropLat: 25.5820,
      dropLng: 85.1350,
      payloadWeight: 1.5,
      status: 'on the way',
      description: 'Documents'
    });

    await Order.create({
      user: user2._id,
      drone: null,
      pickupLocation: 'Danapur, Patna',
      pickupLat: 25.6142,
      pickupLng: 85.0434,
      dropLocation: 'Patna Sahib',
      dropLat: 25.6010,
      dropLng: 85.1800,
      payloadWeight: 4.0,
      status: 'pending',
      description: 'Electronics'
    });

    console.log('Orders created...');
    console.log('✅ Seed data added successfully!');
    console.log('Admin login: rehan@gmail.com / rehan1234');
    console.log('User login: amit@gmail.com / amit1234');
    process.exit(0);

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();