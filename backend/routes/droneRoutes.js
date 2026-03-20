const express = require('express');//Create router instance
const router = express.Router();//keeps drone routes seprated
const { getAllDrones, createDrone, updateDrone, deleteDrone , getDrone } = require('../controllers/droneController');//import controllers, link routes->logic
const { protect, adminOnly } = require('../middleware/authMiddleware');//import middleware , protect->check logic , adminOnly -> check admin role

router.get('/:id', protect, getDrone);
router.get('/', protect, getAllDrones);//get all drone , endpoint(GET /api/drones) , Requires login , Any logged-in user can view drones
router.post('/', protect, adminOnly, createDrone);//CREATE drone ,Endpoint: POST /api/drones ,Only admin can create drones 
router.put('/:id', protect, adminOnly, updateDrone);//UPDATE drone ,Endpoint: PUT /api/drones/:id , Updates specific drone , Admin only
router.delete('/:id', protect, adminOnly, deleteDrone);//DELETE drone ,Endpoint: DELETE /api/drones/:id , admin only

module.exports = router;