const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv');
const connectDB=require('./config/db');
const authRoutes=require('./routes/authRoutes');
const droneRoutes = require('./routes/droneRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();
connectDB();

const app=express();
app.use(cors());
app.use(express.json());

app.get('/',(req , res)=>{
    res.json({message: 'Welcome to DropZone API'});
});
app.use('/api/auth', authRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`DropZone server running on port ${PORT} `);
});