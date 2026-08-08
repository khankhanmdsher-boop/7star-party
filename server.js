const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Load or Initialize Data
let appData = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : { seats: {}, users: {} };

function saveData() { fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2)); }

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

io.on('connection', (socket) => {
    socket.emit('init-state', appData);

    socket.on('seat-take', (data) => {
        appData.seats[data.seat] = data;
        saveData();
        io.emit('seat-update', data);
    });

    socket.on('ceo-apply-perm', (data) => {
        // Admin Auth check can be added here
        appData.seats[data.seat] = { ...appData.seats[data.seat], ...data };
        saveData();
        io.emit('ceo-perm-applied', data);
    });
});

server.listen(PORT, () => console.log(`Server Final Production Ready on ${PORT}`));
