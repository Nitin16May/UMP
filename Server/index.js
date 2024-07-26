require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const authMiddleware = require('./authMiddleware');

mongoose.connect(process.env.MongoDB_URI).then(console.log('Database Connected!'));

app.use(cors());
app.use(express.json());

app.use('/', require('./routes/auth'));
app.use('/', authMiddleware, require('./routes/user'));
app.use('/', authMiddleware, require('./routes/project'));

app.listen(5000, () => {
	console.log(`Server is running on port ${5000}`);
});

module.exports = app;
