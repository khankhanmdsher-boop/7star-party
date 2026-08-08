const express = require('express');
const app = express();
const path = require('path');

// पब्लिक फोल्डर को सीधे सर्व करें
app.use(express.static('public'));

// किसी भी रिक्वेस्ट पर index.html दिखाएं
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server started on port ' + PORT));
