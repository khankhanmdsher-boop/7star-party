const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/wallet', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wallet.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
