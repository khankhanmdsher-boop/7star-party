const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || "";

if (MONGO_URL) {
    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB Connected Successfully!')
    ).catch(err => console.log('MongoDB Connection Error: ', err));
}

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    coins: { type: Number, default: 5000000 }
});

const User = mongoose.model('User', userSchema);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('register-user', async (data) => {
        const username = data && data.name ? data.name : "User_" + socket.id.substring(0, 4);
        socket.username = username;
        try {
            if (mongoose.connection.readyState === 1) {
                let user = await User.findOne({ username });
                if (!user) {
                    user = new User({ username, coins: 5000000 });
                    await user.save();
                }
                socket.emit('balance-update', user.coins);
            }
        } catch (e) {
            console.log(e);
        }
    });
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log('7 Star Engine Active on port ' + PORT));
