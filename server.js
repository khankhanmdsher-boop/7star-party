const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 10000;

// ब्राउज़र कैश को पूरी तरह बंद करने का Header
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
