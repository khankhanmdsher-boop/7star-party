const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'), (err) => {
        if (err) res.sendFile(path.join(__dirname, 'admin.html'));
    });
});

app.get('/wallet', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wallet.html'), (err) => {
        if (err) res.sendFile(path.join(__dirname, 'wallet.html'));
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
