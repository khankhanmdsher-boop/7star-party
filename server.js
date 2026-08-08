const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let users = { "Player1": { coins: 5000000 } };

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.emit('balance-update', users["Player1"].coins);

    socket.on('play-coin-game', (data) => {
        const { boxes, bet } = data;
        const totalBet = bet * boxes.length;
        const user = users["Player1"];

        if (boxes.length > 6) return socket.emit('chat-alert', '❌ Max 6 बॉक्स ही चुन सकते हैं!');
        if (user.coins < totalBet) return socket.emit('chat-alert', '❌ आपके पास कॉइन्स कम हैं!');
        
        user.coins -= totalBet;

        const rand = Math.random();
        let multiplier = 0;

        if (rand < 0.65) multiplier = 0;      // 65% हार
        else if (rand < 0.80) multiplier = 1.5; // 15% रिटर्न
        else if (rand < 0.90) multiplier = 2;   // 10% रिटर्न
        else if (rand < 0.95) multiplier = 5;   // 5% रिटर्न
        else multiplier = 10;                  // 5% जैकपॉट रिटर्न

        const winBox = Math.floor(Math.random() * 8) + 1;
        const isWin = boxes.includes(winBox);

        if (isWin && multiplier > 0) {
            const winAmount = totalBet * multiplier;
            user.coins += winAmount;
            io.emit('chat-alert', `🎉 जीत! विनिंग बॉक्स: ${winBox} | मिले: ${winAmount} Coins!`);
        } else {
            io.emit('chat-alert', `💔 हार गए! विनिंग बॉक्स था: ${winBox}`);
        }

        socket.emit('balance-update', user.coins);
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log('7 Star Engine Active on port ' + PORT));
