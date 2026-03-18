const User = require('../models/User');//import User model(MongoDB Schema),used to read/write uses
const bcrypt = require('bcryptjs');//Library to hash passwords,Prevents storing plain passwords
const jwt = require('jsonwebtoken');//Creates authentication tokens (JWT),Used for login sessions

exports.register = async (req, res) => {//API controller for user signup
  try {
    const { name, email, password, role } = req.body;//Extracts user input from frontend
    const userExists = await User.findOne({ email });//Searches DB for existing email
    if (userExists) {//Stops duplicate accounts
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);//Generates random salt (complexity = 10)
    const hashedPassword = await bcrypt.hash(password, salt);//Converts password → secure hash
    const user = await User.create({//Stores user in DB,Password saved securely
      name,
      email,
      password: hashedPassword,
      role
    });
    const token = jwt.sign({ id: user._id, role: user.role },//Creates JWT token,Secret key from .env,Token valid for 7 days
      process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });//Sends token + user data to frontend
  } catch (error) {//If anything fails → server error
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {//Handles user login
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {//Email not found → reject
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);//Compares entered password with hashed one
    if (!isMatch) {//Wrong password → reject
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role },
      process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};