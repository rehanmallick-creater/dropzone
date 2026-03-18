const Drone = require('../models/Drone');// load drone Schema, Used to intract with drone collection in DB

exports.getAllDrones = async (req, res) => {// API to fetch all drones
  try {
    const drones = await Drone.find();//Gets all drone record s from DB
    res.status(200).json(drones);//send data back
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDrone = async (req, res) => {//create drone
  try {
    const { name, battery, latitude, longitude } = req.body;// Gets drone data from frontend
    const drone = await Drone.create({ name, battery, latitude, longitude });//insert new drone in data base
    res.status(201).json(drone);//return create drone
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDrone = async (req, res) => {// Update drone
  try {
    const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, { new: true });//find drone with ID , Update with new data , { new: true }->return update version
    if (!drone) return res.status(404).json({ message: 'Drone not found' });//if ID doesn't exist
    res.status(200).json(drone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDrone = async (req, res) => {//delete drone
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);// delete drone by ID
    if (!drone) return res.status(404).json({ message: 'Drone not found' });
    res.status(200).json({ message: 'Drone deleted successfully' });
  } catch (error) {// Basic error response
    res.status(500).json({ message: error.message });
  }
};