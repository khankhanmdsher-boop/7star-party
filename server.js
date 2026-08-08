const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('chat-msg', (data) => socket.broadcast.emit('chat-msg', data));
    socket.on('seat-take', (data) => io.emit('seat-update', data));
    socket.on('seat-leave', (data) => io.emit('seat-remove', data));
    socket.on('ceo-apply-perm', (data) => io.emit('ceo-perm-applied', data));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
