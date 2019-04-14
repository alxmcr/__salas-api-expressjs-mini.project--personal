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
const Room = require('../models/room');
const Event = require('../models/event');

// ⭐⭐⭐ Pass 'app' for routing
module.exports = function(app) {
    app.get('/', (req, res) => {
        //console.log(`Route ${req.path}`);
        res.send('Hello.com');
    });

     /**
     * @api {get} /rooms Request Rooms information
     * @apiGroup Room
     *
     *
     * @apiSuccess {Room[]} rooms Array of Rooms.
     */
    app.get('/rooms', (req, res) => {
        Room.find(function(err, rooms) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };

            // Change ID
            const roomsFormatted = changeIdToRooms(rooms);
            res.status(200).json(roomsFormatted);
        })
    });

    /**
     * @api {get} /rooms/:id Request Room information
     * @apiGroup Room
     *
     * @apiParam {Number} id Room ID.
     *
     * @apiSuccess {String} title Title of the User.
     * @apiSuccess {Datetime} created  Created Time.
     */
    app.get('/rooms/:id', (req, res) => {
        Room.findById({ _id: req.params.id }, function(err, room) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };

            const roomChanged = changeIDRoom(room);
            res.status(200).json(roomChanged);
        })
    });

    /**
     * @api {post} /rooms/ Create a new room
     * @apiGroup Room
     * 
     * @apiParam {String} title Title of the Room.
     * 
     * @apiSuccess {String} title Title of the Room.
     * 
     * @apiError RoomNotValid The <code>title</code> of the Room was not valid.
     * 
     */
    app.post('/rooms', (req, res) => {
        console.log('req.body', req.body);
        
        Room.create(req.body, function (err, room) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };

            const roomChanged = changeIDRoom(room);
            res.status(201).json(roomChanged);
        })
    });

    /**
     * @api {delete} /rooms/:id Delete a specific Room
     * @apiGroup Room
     *
     * @apiParam {Number} id Room ID.
     *
     * @apiSuccess {String} message Success Message
     * 
     * @apiError RoomNotFound The <code>id</code> of the Room was not found.
     */
    app.delete('/rooms/:id', (req, res) => {
        const id = req.params.id;

        Room.findOneAndDelete({ _id: id }, function(err) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };

            Event.deleteMany({ resourceId: id }, function(err){
                if (err) {
                    console.log(`Error ${err}`); 
                    return res.status(400).send(`Error ${err}`) 
                };
                res.status(200).send(`Room #${id} deleted`)
            })
        })
    });

    /**
     * @api {put} /rooms/:id Update an existent room
     * @apiGroup Room
     * 
     * @apiParam {Number} id Room ID.
     * @apiParam {String} titleNew Title of the Room.
     * 
     * @apiSuccess {String} titleUpdated Title of the Room.
     * 
     * @apiError RoomNotFound The <code>id</code> of the Room was not found.
     * @apiError RoomNotValid The <code>title</code> of the Room was not valid.
     * 
     */
    app.put('/rooms/:id', (req, res) => {
        console.log('req.params.id', req.params.id);
        console.log('req.body', req.body);

        Room.findById({
            _id: req.params.id
        }, function(err, room) {
            if (err) {
                console.log(`Error ${err}`); 
                return res.status(400).send(`Error ${err}`) 
            };

            // Update all fields
            room.set(req.body);

            room.save(function (err, updatedRoom) {
                if (err) {
                    console.log(`Error ${err}`); 
                    return res.status(400).send(`Error ${err}`) 
                };
                res.status(200).json(updatedRoom);
            });            
        });
    });

}

function changeIdToRooms(rooms){
    let roomsChanged = [];

    rooms.forEach(room => {

        const roomChanged = changeIDRoom(room);
        roomsChanged.push(roomChanged);
    });

    return roomsChanged;
}

function changeIDRoom(room){
    const { _id, title, created } = room;

    const roomChanged = {
        id: _id,
        title,
        created
    };

    return roomChanged;
}