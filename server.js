const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 10000;

// वॉइस रूम कनेक्शन हैंडलर
io.on('connection', (socket) => {
    console.log('एक यूज़र कनेक्ट हुआ:', socket.id);

    // रूम जॉइन करना
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        console.log(`User ${userId} joined room: ${roomId}`);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    // वॉइस डेटा ट्रांसफर (WebRTC Signaling)
    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', {
            from: socket.id,
            signal: data.signal
        });
    });
});

app.get('/', (req, res) => {
    res.send('<h1>7 Star Voice Engine is Live & Running! 🎙️</h1>');
});

server.listen(PORT, () => {
    console.log(`Voice Server listening on port ${PORT}`);
});
