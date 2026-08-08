const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://cluster0.mongodb.net/starparty?retryWrites=true&w=majority";

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected Successfully!')
).catch(err => console.log('MongoDB Connection Error: ', err));

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    coins: { type: Number, default: 5000000 }
});

const User = mongoose.model('User', userSchema);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    if (fs.existsSync(path.join(__dirname, 'public', 'index.html'))) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

io.on('connection', (socket) => {
    socket.on('register-user', async (data) => {
        const username = data.name || "User_" + socket.id.substring(0, 4);
        socket.username = username;
        
        try {
            let user = await User.findOne({ username });
            if (!user) {
                user = new User({ username, coins: 5000000 });
                await user.save();
            }
            socket.emit('balance-update', user.coins);
        } catch (e) {
            console.log(e);
        }
    });

    socket.on('play-coin-game', async (data) => {
        const username = socket.username || "User_" + socket.id.substring(0, 4);
        try {
            let user = await User.findOne({ username });
            if (!user) user = new User({ username, coins: 5000000 });
            
            const { boxes, bet } = data;
            const totalBet = bet * boxes.length;

            if (!boxes || boxes.length === 0) return socket.emit('chat-alert', '❌ कोई खाना चुनें!');
            if (boxes.length > 6) return socket.emit('chat-alert', '❌ Max 6 बॉक्स ही चुन सकते हैं!');
            if (user.coins < totalBet) return socket.emit('chat-alert', '❌ आपके पास कॉइन्स कम हैं!');
            
            user.coins -= totalBet;

            const rand = Math.random();
            let multiplier = 0;

            if (rand < 0.65) multiplier = 0;
            else if (rand < 0.80) multiplier = 1.5;
            else if (rand < 0.90) multiplier = 2;
            else if (rand < 0.95) multiplier = 5;
            else multiplier = 10;

            const winBox = Math.floor(Math.random() * 8) + 1;
            const isWin = boxes.includes(winBox);

            if (isWin && multiplier > 0) {
                const winAmount = totalBet * multiplier;
                user.coins += winAmount;
                io.emit('chat-alert', `🎉 ${username} जीता! विनिंग बॉक्स: ${winBox} | मिले: ${winAmount} Coins!`);
            } else {
                io.emit('chat-alert', `💔 ${username} हार गया! विनिंग बॉक्स था: ${winBox}`);
            }

            await user.save();
            socket.emit('balance-update', user.coins);
        } catch (e) {
            console.log(e);
        }
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log('7 Star Engine Active on port ' + PORT));
