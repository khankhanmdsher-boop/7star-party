const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    if (req.path === '/admin') {
        return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    }
    if (req.path === '/wallet') {
        return res.sendFile(path.join(__dirname, 'public', 'wallet.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
