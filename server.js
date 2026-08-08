const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
http.listen(PORT, () => console.log('Server running on port ' + PORT));
