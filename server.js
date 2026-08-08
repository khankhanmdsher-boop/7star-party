const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.static('.'));

io.on('connection', (socket) => {
    socket.on('join-mic', (micId) => {
        socket.broadcast.emit('user-joined-mic', { id: socket.id, micId });
    });
    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
