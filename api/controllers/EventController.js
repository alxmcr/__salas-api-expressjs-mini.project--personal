const moment = require('moment');

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
const Event = require('../models/event');
const Room = require('../models/room');
const User = require('../models/user');

// ⭐⭐⭐ Pass 'app' for routing
module.exports = function(app) {
    app.get('/', (req, res) => {
        //console.log(`Route ${req.path}`);
        res.send('Hello.com');
    });

    /**
     * @api {get} /events Request Events information
     * @apiGroup Event
     *
     *
     * @apiSuccess {Event[]} events Array of Events.
     */
    app.get('/events', (req, res) => {
        Event.find(function(err, events) {
            if (err) {
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            };

            // Change ID
            const eventsFormatted = changeIdToEvents(events);
            res.status(200).json(eventsFormatted);
        })
    });

    /**
     * @api {get} /events-datatable Request Events information
     * @apiGroup Event
     *
     *
     * @apiSuccess {Event[]} events Array of Events.
     */
    app.get('/events-datatable', (req, res) => {
        Event.find(function(err, events) {
            if (err) {
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            };

            // Change ID
            const eventsFormatted = changeToEventsVuetify(events);
            res.status(200).json(eventsFormatted);
        })
    });

    /**
     * @api {get} /events-vuetify Request Events information
     * @apiGroup Event
     *
     *
     * @apiSuccess {Event[]} events Array of Events.
     */
    app.get('/events-vuetify', (req, res) => {
        Event.find(function(err, events) {
            if (err) {
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            };

            // Change ID
            const eventsFormatted = changeToEventsVuetify(events);
            res.status(200).json(eventsFormatted);
        })
    });

    /**
     * @api {get} /events/:id Request Event information
     * @apiGroup Event
     *
     * @apiParam {Number} id Event ID.
     *
     * @apiSuccess {String} title Title of the User.
     * @apiSuccess {ObjectId} user_id  ID User.
     * @apiSuccess {ObjectId} resourceId  ID User.
     * @apiSuccess {Datetime} start  Start Time.
     * @apiSuccess {Datetime} end  End Time.
     * @apiSuccess {Boolean} overlap Allow overlapping events.
     * @apiSuccess {Datetime} created  Created Time.
     */
    app.get('/events/:id', (req, res) => {
        Event.findById({
            _id: req.params.id
        }, function(err, event) {
            if (err) {
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            };
            // ChangeID
            const eventChanged = changeIDEvent(event);
            res.status(200).json(eventChanged);
        })
    });

    /**
     * @api {get} /events/rooms/:id Request All Events for a specific Room
     * @apiGroup Event
     *
     * @apiParam {Number} id User ID.
     *
     * @apiSuccess {String} title Title of the User.
     * @apiSuccess {ObjectId} user_id  ID User.
     * @apiSuccess {ObjectId} resourceId  ID User.
     * @apiSuccess {Datetime} start  Start Time.
     * @apiSuccess {Datetime} end  End Time.
     * @apiSuccess {Boolean} overlap Allow overlapping events.
     * @apiSuccess {Datetime} created  Created Time.
     */
    app.get('/events/rooms/:id', (req, res) => {
        Event.find({
            resourceId: new mongoose.Types.ObjectId(req.params.id)
        }, function(err, events) {
            if (err) {
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            };
            // Change ID
            const eventsFormatted = changeIdToEvents(events);
            res.status(200).json(eventsFormatted);
        })
    });

    /**
     * @api {get} /events/users/:id Request All Events for a specific User
     * @apiGroup Event
     *
     * @apiParam {Number} id Room ID.
     *
     * @apiSuccess {String} title Title of the User.
     * @apiSuccess {ObjectId} user_id  ID User.
     * @apiSuccess {ObjectId} resourceId  ID User.
     * @apiSuccess {Datetime} start  Start Time.
     * @apiSuccess {Datetime} end  End Time.
     * @apiSuccess {Boolean} overlap Allow overlapping events.
     * @apiSuccess {Datetime} created  Created Time.
     */
    app.get('/events/users/:id', (req, res) => {
        Event.find({
            user_id: new mongoose.Types.ObjectId(req.params.id)
        }, function(err, events) {
            if (err) {
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            };
            // Change ID
            const eventsFormatted = changeIdToEvents(events);
            res.status(200).json(eventsFormatted);
        })
    });

    /**
     * @api {post} /events/ Create a new event
     * @apiGroup Event
     * 
     * @apiParam {String} title Title of the User.
     * @apiParam {ObjectId} user_id  ID User.
     * @apiParam {ObjectId} resourceId  ID User.
     * @apiParam {Datetime} start  Start Time.
     * @apiParam {Datetime} end  End Time.
     * 
     * @apiSuccess {String} title Title of the User.
     * @apiSuccess {ObjectId} user_id  ID User.
     * @apiSuccess {ObjectId} resourceId  ID User.
     * @apiSuccess {Datetime} start  Start Time.
     * @apiSuccess {Datetime} end  End Time.
     * @apiSuccess {Boolean} overlap Allow overlapping events.
     * @apiSuccess {Datetime} created  Created Time.
     * 
     * @apiError EventNotValid The <code>title</code> of the Event was not valid.
     * @apiError EventNotValid The <code>user_id</code> of the Event was not valid.
     * @apiError EventNotValid The <code>resourceId</code> of the Event was not valid.
     * @apiError EventNotValid The <code>start</code> of the Event was not valid.
     * @apiError EventNotValid The <code>end</code> of the Event was not valid.
     * @apiError EventNotValid The <code>id</code> of the Event was not valid.
     * @apiError EventNotValid The <code>id</code> of the Event was not valid.
     */
    app.post('/events', async (req, res) => {

        console.log('----------POST----------')
        console.log('req.body', req.body)
        console.log('------------')

        try {

            const {
                start,
                end,
                resourceId,
                user_id
            } = req.body;

            const startMoment = moment.utc(start);
            const endMoment = moment.utc(end);

            const isValid = isValidTimes(startMoment, endMoment);

            if (isValid) {

                const userById = await User.findById(user_id).exec();
                const roomById = await Room.findById(resourceId).exec();

                if (userById !== null) {
                    if (roomById !== null) {
                        const eventCreated = await Event.create(req.body);

                        if (eventCreated !== null) {
                            // ChangeID
                            const eventChanged = changeIDEvent(eventCreated);

                            res.status(201).json(eventChanged);
                        } else {
                            const err = 'Error. Event can not be created';
                            console.log(`Error ${err}`);
                            return res.status(400).send(`Error ${err}`)
                        }
                    } else {
                        const err = 'Error. Room does not exist';
                        console.log(`Error ${err}`);
                        return res.status(400).send(`Error ${err}`)
                    }
                } else {
                    const err = 'Error. User does not exist';
                    console.log(`Error ${err}`);
                    return res.status(400).send(`Error ${err}`)
                }

            } else {
                const error = "Start time can not be after End time";
                console.error(error);
                return res.status(400).send(`Error ${error}`)
            }
        } catch (error) {
            console.error(`Exception ${error}`);
            return res.status(400).send(`Error ${error}`)
        }
    });


    /**
     * @api {put} /events/:id Update Event information
     * @apiGroup Event
     *
     * @apiParam {Number} id Event ID.
     *
     * @apiSuccess {String} title Title of the User.
     * @apiSuccess {ObjectId} user_id  ID User.
     * @apiSuccess {ObjectId} resourceId  ID User.
     * @apiSuccess {Datetime} start  Start Time.
     * @apiSuccess {Datetime} end  End Time.
     * @apiSuccess {Boolean} overlap Allow overlapping events.
     * @apiSuccess {Datetime} created  Created Time.
     * 
     * @apiError EventNotFound The <code>id</code> of the Event was not found.
     */
    app.put('/events/:id', async (req, res) => {

        try {
            console.log('----------PUT----------')

            console.log('req.params.id', req.params.id);
            console.log('req.body', req.body);

            let errors = [];

            var ObjectId = require('mongoose').Types.ObjectId;

            if (ObjectId.isValid(req.params.id)) {

                const {
                    start,
                    end,
                    resourceId,
                    user_id
                } = req.body;

                // valid variable
                let validResourceId = false;
                let validUser = false;
                let validStart = false;
                let validEnd = false;
                let validStartBeforeEnd = false;
                let validEndAfterStart = false;

                // Times
                let auxStart = null;
                let auxEnd = null;

                if (start === null || start === '' || typeof start === 'undefined') {
                    validStart = true;
                } else {
                    // Moment.js
                    auxStart = moment.utc(start, moment.ISO_8601);
                    validStart = isValidTimeMoment(auxStart);
                }

                if (end === null || end === '' || typeof end === 'undefined') {
                    validEnd = true;
                } else {
                    // Moment.js
                    auxEnd = moment.utc(end, moment.ISO_8601);
                    validEnd = isValidTimeMoment(auxEnd);
                }

                if (resourceId === null || resourceId === '' || typeof resourceId === 'undefined') {
                    validResourceId = true;
                } else {
                    validResourceId = await isValidResourceId(resourceId);
                }

                if (user_id === null || user_id === '' || typeof user_id === 'undefined') {
                    validUser = true;
                } else {
                    validUser = await isValidUserId(user_id);
                }

                if (validStart === false) {
                    errors.push('Start time is invalid');
                }

                if (validEnd === false) {
                    errors.push('End time is invalid');
                }

                if (validResourceId === false) {
                    errors.push('ResourceID is invalid');
                }

                if (validUser === false) {
                    errors.push('UserID is invalid');
                }

                if (validResourceId && validUser && validStart && validEnd) {
                    console.log('Updating...');

                    Event.findById({
                        _id: req.params.id
                    }, function(err, event) {

                        if (err) {
                            console.log(`Error ${err}`);
                            return res.status(400).send(`Error ${err}`)
                        };

                        if (event === null) {
                            const err = "Event does not exist.";
                            console.log(`Error ${err}`);
                            return res.status(400).send(`Error ${err}`)
                        } else {

                            const idEvent = event.id;
                            const startOld = moment.utc(event.start, moment.ISO_8601);
                            const endOld = moment.utc(event.end, moment.ISO_8601);

                            if (auxStart === null) {
                                validStartBeforeEnd = true;
                            } else {
                                validStartBeforeEnd = auxStart.isBefore(auxEnd);
                            }

                            if (auxEnd === null) {
                                validEndAfterStart = true;
                            } else {
                                validEndAfterStart = auxEnd.isAfter(auxStart);
                            }

                            if (validStartBeforeEnd && validEndAfterStart) {

                                Event.find(function(err, events) {
                                    if (err) {
                                        console.log(`Error ${err}`);
                                        return res.status(400).send(`Error ${err}`)
                                    };

                                    if (events === null && events.length === 0) {
                                        const err = 'Database does not have events';
                                        console.log(`Error ${err}`);
                                        return res.status(400).send(`Error ${err}`)
                                    } else {

                                        // allEventsWithoutEvent
                                        const allEventsWithoutEvent = events.filter(event => event.id !== idEvent);

                                        const isOverlap = isAnOverlapEvent(allEventsWithoutEvent, resourceId, auxStart, auxEnd)

                                        if (isOverlap) {
                                            const err = 'This event overlaps another event';
                                            console.log(`Error ${err}`);
                                            return res.status(400).send(`Error ${err}`)
                                        } else {
                                            // Save the changes
                                            event.set(req.body);

                                            event.save(function(err, updatedEvent) {
                                                if (err) {
                                                    console.log(`Error ${err}`);
                                                    return res.status(400).send(`Error ${err}`)
                                                };

                                                console.log('updatedEvent', updatedEvent)

                                                // ChangeID
                                                const eventChanged = changeIDEvent(updatedEvent);
                                                console.log('Updated', eventChanged);

                                                res.status(200).json(eventChanged);
                                            });
                                        }
                                    }
                                });
                            } else {
                                const err = "Start and End time are not valid.";
                                console.log(`Error ${err}`);
                                return res.status(400).send(`Error ${err}`)
                            }

                        }
                    })

                } else {
                    console.error(errors.toString());
                    return res.status(400).send(errors.toString())
                }
            } else {
                const err = "ID Event is not valid.";
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            }


        } catch (error) {
            console.error(`Exception --> ${error}`);
            return res.status(400).send(error)
        }
    });

    /**
     * @api {delete} /events/:id Delete a specific Event
     * @apiGroup Event
     *
     * @apiParam {Number} id Event ID.
     *
     * @apiSuccess {String} message Success Message
     * 
     * @apiError EventNotFound The <code>id</code> of the Event was not found.
     */
    app.delete('/events/:id', (req, res) => {
        const id = req.params.id;

        Event.findOneAndDelete({
            _id: id
        }, function(err, event) {
            if (err) {
                console.log(`Error ${err}`);
                return res.status(400).send(`Error ${err}`)
            };
            res.status(200).send(`Event #${id} deleted`);
        })
    });

}

function isAnOverlapEvent(events, resourceID, startMoment, endMoment) {

    console.log('events', events);
    console.log('resourceID', resourceID);
    console.log('startMoment', startMoment.toString());
    console.log('endMoment', endMoment.toString());

    try {
        if (moment.isMoment(startMoment) && moment.isMoment(endMoment)) {

            // Filter Events by a specific resource
            const eventsByResource = events.filter(function(event) {
                return event.resourceId.equals(resourceID)
            });

            console.log('eventsByResource', eventsByResource);

            for (let i = 0; i < eventsByResource.length; i++) {

                const eventA = eventsByResource[i];

                const startAMoment = moment.utc(eventA.start, moment.ISO_8601);
                const endAMoment = moment.utc(eventA.end, moment.ISO_8601);

                if (moment.isMoment(startAMoment) && moment.isMoment(endAMoment)) {

                    // start-time in between any of the events
                    if (moment(startMoment).isAfter(startAMoment) && moment(startMoment).isBefore(endAMoment)) {
                        console.log("start-time in between any of the events")
                        return true;
                    }
                    //end-time in between any of the events
                    if (moment(endMoment).isAfter(startAMoment) && moment(endMoment).isBefore(endAMoment)) {
                        console.log("end-time in between any of the events")
                        return true;
                    }
                    //any of the events in between/on the start-time and end-time
                    if (moment(startMoment).isSameOrBefore(startAMoment) && moment(endMoment).isSameOrAfter(endAMoment)) {
                        console.log("any of the events in between/on the start-time and end-time")
                        return true;
                    }
                } else {
                    const error = 'Error, Any event on array of events is not valid. start or end are not Moment objects';
                    console.error(error);
                    throw new Error(error);
                }
            }
            return false;
        } else {
            const error = 'Error, start or end are not Moment objects';
            console.error(error);
            throw new Error(error);
        }
    } catch (error) {
        throw error;
    }
}

function isValidTimeMoment(time) {

    try {
        let result = false;

        if (moment.isMoment(time)) {

            if (time.isValid()) {
                result = true;
            } else {
                const error = 'The time is not valid';
                console.error(error);
            }
        } else {
            const error = 'The time is not a moment objects';
            console.error(error);
        }

        return result;
    } catch (error) {
        console.error(`Exception ${error}`);
        return res.status(400).send(error)
    }
}

async function isValidResourceId(resourceId) {
    try {
        let result = false;
        let resource = null;

        resource = await Room.findById(resourceId).exec()
            .then(response => {
                return response
            })
            .catch(err => {
                console.error(err);
            });

        if (resource !== null) {
            result = true;
        } else {
            const error = "Resource ID is not valid";
            console.error(`Error. ${error}`);
        }

        return result;
    } catch (error) {
        console.error(`Exception ${error}`);
        return res.status(400).send(error)
    }
}


async function isValidUserId(user_id) {


    try {
        let result = false;
        let user = null;

        user = await User.findById(user_id).exec()
            .then(response => {
                return response
            })
            .catch(err => {
                console.error(err);
            });

        if (user !== null) {
            result = true;
        } else {
            const error = "User ID is not valid";
            console.error(`Error ${error}`);
        }

        return result;
    } catch (error) {
        console.error(`Exception ${error}`);
        return res.status(400).send(error)
    }
}

function isValidTimes(beginningTime, endTime) {
    let result = false;

    if (moment.isMoment(beginningTime) && moment.isMoment(endTime)) {
        // Moment.js: Times

        if (beginningTime.isValid() && endTime.isValid()) {

            // Time: start < end
            const isTheTimesOK = beginningTime.isBefore(endTime);
            if (isTheTimesOK) {
                result = true;
            }
        } else {
            const error = 'Start and End time are not valid';
            console.error(error);
        }
    } else {
        const error = 'Start and End time are not Moment objects';
        console.error(error);
    }

    return result;
}

function validDate(date) {
    if (date) {
        const dateM = moment(date, 'YYYY-MM-DDTHH:mm', true);
        return dateM.isValid();
    }
    return false;
}

function validPutDate(date) {
    if (date) {
        const dateM = moment(date, 'YYYY-MM-DDTHH:mm:ss', true);
        return dateM.isValid();
    }
    return false;
}

function changeToEventsVuetify(events) {
    let eventsChanged = [];

    events.forEach(event => {

        const eventChanged = changeEventVuetify(event);
        eventsChanged.push(eventChanged);
    });

    return eventsChanged;
}

function changeIdToEvents(events) {
    let eventsChanged = [];

    events.forEach(event => {

        const eventChanged = changeIDEvent(event);
        eventsChanged.push(eventChanged);
    });

    return eventsChanged;
}

function changeIDEvent(event) {
    const {
        _id,
        user_id,
        title,
        resourceId,
        overlap,
        start,
        end,
        created
    } = event;

    const eventChanged = {
        id: _id,
        user_id,
        title,
        resourceId,
        overlap,
        start,
        end,
        created,
    };

    return eventChanged;
}

function changeEventVuetify(event) {
    const {
        _id,
        user_id,
        title,
        resourceId,
        overlap,
        start,
        end,
        created
    } = event;

    var date = moment(event.start).format('YYYY-MM-DD');
    var timeStart = moment(event.start).format('HH:mm:ss');
    var timeEnd = moment(event.end).format('HH:mm:ss');

    const eventChanged = {
        id: _id,
        user_id,
        title,
        resourceId,
        overlap,
        date,
        start: timeStart,
        end: timeEnd,
        created,
    };

    return eventChanged;
}