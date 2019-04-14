const morgan = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')

// Express
const express = require('express');
const app = express();

// Errors
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

// Logger
app.use(morgan('common'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// CORS
app.use(cors());

// Controllers
const LoginController = require('./api/controllers/LoginController');
const UserController = require('./api/controllers/UserController');
const RoomController = require('./api/controllers/RoomController');
const EventController = require('./api/controllers/EventController');

// Invoke
LoginController(app);
UserController(app);
RoomController(app);
EventController(app);

// Listen
const host = 'localhost';
const port = 9090;

app.listen(port, host, function () {
    console.log(`Server is running on http://${host}:${port}`);
});
