const express = require('express');
const cors = require('cors');
require('dotenv').config();
const carRoutes = require('./routes/cars');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');

const app = express();

app.use(cors());
app.use(express.json());

const path = require('path');

app.use('/images', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

