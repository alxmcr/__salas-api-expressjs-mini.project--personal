const mongoose = require('mongoose');
mongoose.set('debug', true);

// MONGO DB
const configMongoDB = require('../../_config/configMongoDB');
// console.log('\nconfigMongoDB', configMongoDB.connectionString);

mongoose.connect(configMongoDB.connectionString, {
    useNewUrlParser: true
});

// Checking connection
var db = mongoose.connection;
// Error
db.on('error', console.error.bind(console, 'connection error:'));
// we're connected!
db.once('open', function() {
    console.log("we're connected!");
});

// Model: 
const User = require('../models/user');

// ⭐⭐⭐ Pass 'app' for routing
module.exports = function(app) {

    app.post('/login', (req, res) => {
        User.findOne(req.body, function (err, user) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };
            res.status(200).json(user);
        });

    });

}