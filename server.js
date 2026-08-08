const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 10000;

// Room Memory State
let roomState = {
    seats: {} // Stores seat data: { 1: { user, role, frame, medal } }
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    // Send current room state to new user
    socket.emit('init-state', roomState);

    socket.on('chat-msg', (data) => socket.broadcast.emit('chat-msg', data));

    socket.on('seat-take', (data) => {
        roomState.seats[data.seat] = data;
        io.emit('seat-update', data);
    });

    socket.on('seat-leave', (data) => {
        delete roomState.seats[data.seat];
        io.emit('seat-remove', data);
    });

    socket.on('ceo-apply-perm', (data) => {
        // Update state
        if(roomState.seats[data.seat]) {
            roomState.seats[data.seat] = { ...roomState.seats[data.seat], ...data };
        }
        io.emit('ceo-perm-applied', data);
    });
});

server.listen(PORT, () => console.log(`Server final listening on port ${PORT}`));
