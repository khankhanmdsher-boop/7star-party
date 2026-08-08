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

let appData = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : { seats: {}, users: {} };

function saveData() { fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2)); }

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

io.on('connection', (socket) => {
    let currentUserName = null;

    socket.on('register-user', (data) => {
        currentUserName = data.name;
        if(!appData.users[currentUserName]) {
            appData.users[currentUserName] = { coins: 1000, role: 'User' };
            saveData();
        }
        socket.emit('init-state', appData);
    });

    socket.on('seat-take', (data) => {
        appData.seats[data.seat] = { ...data, frame: 'none', medal: 'none' };
        saveData();
        io.emit('seat-update', appData.seats[data.seat]);
    });

    socket.on('seat-leave', (data) => {
        delete appData.seats[data.seat];
        saveData();
        io.emit('seat-remove', data);
    });

    socket.on('ceo-apply-perm', (data) => {
        if(appData.seats[data.seat]) {
            const seatUser = appData.seats[data.seat].user;
            appData.seats[data.seat].role = data.role;
            appData.seats[data.seat].frame = data.frame;
            appData.seats[data.seat].medal = data.medal;

            if(data.addCoins > 0 && appData.users[seatUser]) {
                appData.users[seatUser].coins += data.addCoins;
                io.emit('chat-alert', `💸 CEO added ${data.addCoins} coins to ${seatUser}`);
            }

            saveData();
            io.emit('seat-update', appData.seats[data.seat]);
            io.emit('init-state', appData);
        }
    });

    socket.on('transfer-coins', (data) => {
        const sender = appData.users[data.from];
        const receiver = appData.users[data.to];

        if(sender && receiver && sender.coins >= data.amount) {
            sender.coins -= data.amount;
            receiver.coins += data.amount;
            saveData();
            socket.emit('balance-update', sender.coins);
            io.emit('chat-alert', `💰 ${data.from} transferred ${data.amount} coins to ${data.to}`);
        } else {
            socket.emit('chat-alert', '❌ Transfer Failed: Insufficient Coins or User Not Found');
        }
    });
});

server.listen(PORT, () => console.log(`Server Security & Coins Active on ${PORT}`));
