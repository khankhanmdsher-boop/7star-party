const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

let users = {};

// 1. डाटा लोड करने का फंक्शन
if (fs.existsSync('users.json')) {
    try {
        users = JSON.parse(fs.readFileSync('users.json'));
    } catch (e) {
        users = {};
    }
}

function saveData() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

app.use(express.static('public'));

io.on('connection', (socket) => {
    
    // यूजर का नाम और डेटा सेट करना
    socket.on('register-user', (data) => {
        const username = data.name || "User_" + socket.id.substring(0, 4);
        socket.username = username;
        
        if (!users[username]) {
            users[username] = { coins: 5000000 }; // शुरुआती बैलेंस
            saveData();
        }
        socket.emit('balance-update', users[username].coins);
    });

    socket.on('play-coin-game', (data) => {
        const username = socket.username || "User_" + socket.id.substring(0, 4);
        if (!users[username]) users[username] = { coins: 5000000 };
        
        const user = users[username];
        const { boxes, bet } = data;
        const totalBet = bet * boxes.length;

        // नियम जांचें
        if (!boxes || boxes.length === 0) return socket.emit('chat-alert', '❌ कोई खाना चुनें!');
        if (boxes.length > 6) return socket.emit('chat-alert', '❌ Max 6 बॉक्स ही चुन सकते हैं!');
        if (user.coins < totalBet) return socket.emit('chat-alert', '❌ आपके पास कॉइन्स कम हैं!');
        
        user.coins -= totalBet;

        // आपका ROI गणित
        const rand = Math.random();
        let multiplier = 0;

        if (rand < 0.65) multiplier = 0;        // 65% लॉस
        else if (rand < 0.80) multiplier = 1.5; // 15% चांस
        else if (rand < 0.90) multiplier = 2;   // 10% चांस
        else if (rand < 0.95) multiplier = 5;   // 5% चांस
        else multiplier = 10;                  // 5% जैकपॉट

        const winBox = Math.floor(Math.random() * 8) + 1;
        const isWin = boxes.includes(winBox);

        if (isWin && multiplier > 0) {
            const winAmount = totalBet * multiplier;
            user.coins += winAmount;
            io.emit('chat-alert', `🎉 ${username} जीता! विनिंग बॉक्स: ${winBox} | मिले: ${winAmount} Coins!`);
        } else {
            io.emit('chat-alert', `💔 ${username} हार गया! विनिंग बॉक्स था: ${winBox}`);
        }

        saveData(); // नया बैलेंस सेव करें
        socket.emit('balance-update', user.coins);
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log('7 Star Engine Active on port ' + PORT));
