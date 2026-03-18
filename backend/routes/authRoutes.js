const express = require('express');//Loads Express framework
const router = express.Router();//Create router , Create a mini app (router), used to organize routes seperately, instead of writing everything in server.js , you split logic
const { register, login }= require('../controllers/authController');//Imports functions you wrote earlier

router.post('/register', register);// Define router . call register function , used when user signs up
router.post('/login', login);// call login function , used when user logs in

module.exports = router;// makes router usable in main server