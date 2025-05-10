const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const fs = require('fs');
   const https = require('https');
   const path = require('path');
   const { Server } = require('socket.io');
   const taskRoutes = require('./routes/tasks');

   const app = express();

   // HTTPS credentials
   const privateKey = fs.readFileSync(path.join(__dirname, '192.168.1.97-key.pem'), 'utf8');
   const certificate = fs.readFileSync(path.join(__dirname, '192.168.1.97.pem'), 'utf8');
   const credentials = { key: privateKey, cert: certificate };

   // Middleware
   app.use(cors({
     origin: ['http://localhost:3000', 'http://localhost:5173'],
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type']
   }));
   app.use(express.json());

   // Socket.IO setup
   const httpsServer = https.createServer(credentials, app);
   const io = new Server(httpsServer, {
     cors: {
       origin: ['http://localhost:3000', 'http://localhost:5173'],
       methods: ['GET', 'POST']
     }
   });

   // Attach io to request object
   app.use((req, res, next) => {
     req.io = io;
     next();
   });

   // Routes
   app.use('/api', taskRoutes);

   // MongoDB connection
   mongoose.connect('mongodb://127.0.0.1:27017/tasksync')
     .then(() => console.log('Connected to MongoDB'))
     .catch(err => {
       console.error('MongoDB connection error:', err);
       process.exit(1);
     });

   // Start HTTPS server
   httpsServer.listen(5000, () => {
     console.log('HTTPS Server running on port 5000');
   });