const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const { startProducer, sendMessage } = require('./producer');
const { startConsumer } = require('./consumer');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb+srv://dilkash:dilkash@got.80fjgmo.mongodb.net/GOTTesting?retryWrites=true&w=majority&appName=GOT', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
});

app.use(express.json());
app.use(express.static('public'));

// Route to create a new user
app.post('/users', async (req, res) => {
    try {
        const { name, zoneId, wardNo, vehicleNo } = req.body;
        const user = new User({ name, zoneId, wardNo, vehicleNo });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).send('Error creating user');
    }
});

// Route to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

// Route to delete a user
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            res.send(`User ${user.name} deleted successfully`);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Error deleting user');
    }
});

// WebSocket connection
const activeIntervals = {};  // To track active intervals for each user

io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle request to start sharing location for a specific user
    socket.on('start-sharing', async (userId) => {
        const user = await User.findById(userId);
        if (user) {
            if (!activeIntervals[userId]) {  // Only start if not already started
                const interval = setInterval(() => {
                    const location = {
                        latitude: (Math.random() * 90).toFixed(6),
                        longitude: (Math.random() * 180).toFixed(6),
                    };
                    sendMessage(userId, location);
                }, 2000);

                activeIntervals[userId] = interval;
                io.emit('log', `User ${userId} started sharing location`);
            }
        }
    });

    // Handle request to stop sharing location for a specific user
    socket.on('stop-sharing', (userId) => {
        if (activeIntervals[userId]) {
            clearInterval(activeIntervals[userId]);
            delete activeIntervals[userId];
            io.emit('log', `User ${userId} stopped sharing location`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server and services
const start = async () => {
    await startProducer();
    await startConsumer(io);
    server.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
};

start();

