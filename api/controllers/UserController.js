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
const Event = require('../models/event');

// ⭐⭐⭐ Pass 'app' for routing
module.exports = function(app) {
    app.get('/', (req, res) => {
        //console.log(`Route ${req.path}`);
        res.send('Hello.com');
    });

    /**
     * @api {get} /users Request Users information
     * @apiGroup User
     *
     *
     * @apiSuccess {User[]} users Array of Users.
     */
    app.get('/users', (req, res) => {
        User.find(function(err, users) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };
             // Change ID
            const usersFormatted = changeIdToUsersSecure(users);
            res.status(200).json(usersFormatted);
        })
    });

    /**
     * @api {get} /users Request Users information (Insecure)
     * @apiGroup User
     *
     *
     * @apiSuccess {User[]} users Array of Users.
     */
    app.get('/users-insecure', (req, res) => {
        User.find(function(err, users) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };
             // Change ID
            const usersFormatted = changeIdToUsersInsecure(users);
            res.status(200).json(usersFormatted);
        })
    });

    /**
     * @api {get} /users/:id Request User information
     * @apiGroup User
     *
     * @apiParam {Number} id User ID.
     *
     * @apiSuccess {String} name Name of the User.
     * @apiSuccess {String} lastname Lastname of the User.
     * @apiSuccess {String} username Username of the User.
     * @apiSuccess {String} password Password of the User.
     * @apiSuccess {Datetime} created  Created Time.
     */
    app.get('/users/:id', (req, res) => {
        User.findById({ _id: req.params.id }, function(err, user) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };
            const userChanged = changeIDUserInsecure(user);
            res.status(200).json(userChanged);
        })
    });

    app.post('/users/login', (req, res) => {
        console.log('req.body', req.body);
        User.findOne(req.body, function (err, user) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };
            console.log('user', user);

            if(user == null){
                return res.status(400).send(`Error ${err}`)
            }

            const userChanged = changeIDUserInsecure(user);
            res.status(200).json(userChanged);
        })
    });

    app.post('/users/check-google', (req, res) => {
        console.log('req.body', req.body);
        User.findOne({ email: req.body.email } , function (err, user) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };
            console.log('user', user);

            if(user == null){
                console.log('Error, user is null');
                return res.status(400).send(`Error ${err}`)
            }

            const userChanged = changeIDUserInsecure(user);
            res.status(200).json(userChanged);
        })
    });

    /**
     * @api {post} /users/ Create a new user
     * @apiGroup User
     * 
     * @apiParam {String} name Name of the User.
     * @apiParam {String} lastname Lastname of the User.
     * @apiParam {String} username Username of the User.
     * @apiParam {String} password Password of the User.
     * @apiParam {Datetime} created  Created Time.
     * 
     * @apiSuccess {String} name Name of the User.
     * @apiSuccess {String} lastname Lastname of the User.
     * @apiSuccess {String} username Username of the User.
     * @apiSuccess {String} password Password of the User.
     * @apiSuccess {Datetime} created  Created Time.
     * 
     * @apiError UserNotValid The <code>name</code> of the User was not valid.
     *  @apiError UserNotValid The <code>lastname</code> of the User was not valid.
     *  @apiError UserNotValid The <code>username</code> of the User was not valid.
     * @apiError UserNotValid The <code>password</code> of the User was not valid.
     * @apiError UserNotValid The <code>created</code> of the User was not valid.
     * 
     */
    app.post('/users', (req, res) => {
        User.create(req.body, function (err, user) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };
            const userChanged = changeIDUserInsecure(user);
            res.status(201).json(userChanged);
        })
    });

    /**
     * @api {delete} /users/:id Delete a specific User
     * @apiGroup User
     *
     * @apiParam {Number} id User ID.
     *
     * @apiSuccess {String} message Success Message
     * 
     * @apiError UserNotFound The <code>id</code> of the User was not found.
     */
    app.delete('/users/:id', (req, res) => {
        const id = req.params.id;

        User.findOneAndDelete({ _id: id }, function(err) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };

            Event.deleteMany({ user_id: id }, function(err){
                if (err) {
                    console.log(`Error ${err}`); 
                    return res.status(400).send(`Error ${err}`) 
                };
                res.status(200).send(`User #${id} deleted`)
            })
        })
    });

    /**
     * @api {put} /users/:id Update an existent User
     * @apiGroup User
     * 
     * @apiParam {String} name Name of the User.
     * @apiParam {String} lastname Lastname of the User.
     * @apiParam {String} username Username of the User.
     * @apiParam {String} password Password of the User.
     * @apiParam {Datetime} created  Created Time.
     * 
     * @apiSuccess {String} nameUpdated Name of the User.
     * @apiSuccess {String} lastnameUpdated Lastname of the User.
     * @apiSuccess {String} usernameUpdated Username of the User.
     * @apiSuccess {String} passwordUpdated Password of the User.
     * @apiSuccess {Datetime} created  Created Time.
     * 
     * @apiError UserNotValid The <code>name</code> of the User was not valid.
     *  @apiError UserNotValid The <code>lastname</code> of the User was not valid.
     *  @apiError UserNotValid The <code>username</code> of the User was not valid.
     * @apiError UserNotValid The <code>password</code> of the User was not valid.
     * @apiError UserNotValid The <code>created</code> of the User was not valid.
     * 
     */
    app.put('/users/:id', (req, res) => {
        console.log('req.params.id', req.params.id);
        console.log('req.body', req.body);

        User.findById({
            _id: req.params.id
        }, function(err, user) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };

            // Update all fields
            user.set(req.body);

            user.save(function (err, updatedUser) {
                if (err) {
                    console.log(`Error ${err}`); 
                    return res.status(400).send(`Error ${err}`) 
                };
                res.status(200).json(updatedUser);
            });            
        });
    });
}

function changeIdToUsersSecure(users){
    let usersChanged = [];

    users.forEach(user => {

        const userChanged = changeIDUserSecure(user);
        usersChanged.push(userChanged);
    });

    return usersChanged;
}

function changeIdToUsersInsecure(users){
    let usersChanged = [];

    users.forEach(user => {

        const userChanged = changeIDUserInsecure(user);
        usersChanged.push(userChanged);
    });

    return usersChanged;
}

function changeIDUserSecure(user){
    const { _id, name, lastname, image, created } = user;

    const userChanged = {
        id: _id,
        name,
        lastname,
        image,
        created
    };

    return userChanged;
}

function changeIDUserInsecure(user){
    const { _id, name, lastname, email, username, password, image, created } = user;

    const userChanged = {
        id: _id,
        name,
        lastname,
        email,
        username,
        password,
        image,
        created
    };

    return userChanged;
}