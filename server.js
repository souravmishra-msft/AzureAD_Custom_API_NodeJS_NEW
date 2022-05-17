const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const mongoose = require('mongoose');

// Include routes
const routes = require('./routes/routes');


//Load main config file
dotenv.config({path: './config/main.env'});

// ----------------------------------------------------
// Configure the Express App. Include the middlewares
// ----------------------------------------------------
const app = express();
const PORT = process.env.PORT;

// ------------------------------------------------------
// Connecting to MongoDB-Atlas using mongoose
// ------------------------------------------------------
const db = process.env.DB_CONNECT;
mongoose.connect(db)
        .then(() => console.log(`API Server connected to DB successfully....`))
        .catch((err) => console.log(err));


// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json({type: 'application/json'}));

// Initialize Passport
app.use(passport.initialize());


// Enable CORS (for local testing only - remove in production/deployment)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Routes

app.use('/api/watchlist', routes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
