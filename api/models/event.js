const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// EventSchema Schema
const EventSchema = new Schema({
    title: {
        type: String,
        required: [true, 'title field is required']
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'user_id field is required']
    },
    resourceId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'resourceId field is required']
    },
    start: {
        type: Date,
        required: [true, 'start field is required']
    },
    end: {
        type: Date,
        required: [true, 'end field is required']
    },
    // overlap
    overlap: {
        type: Boolean,
        default: false,
        required: [true, 'overlap field is required']
    },
    created: {
        type: Date,
        default: Date.now
    }
});

// Middleware: POST
EventSchema.post('findOneAndDelete', function(event) {
    console.log('%s has been findOneAndDelete', event._id);
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;