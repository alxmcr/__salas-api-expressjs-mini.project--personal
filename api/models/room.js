const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Room Schema
const RoomSchema = new Schema({
    title: {
        type: String,
        required: [true, 'title field is required']
    },
    created: {
        type: Date,
        default: Date.now
    }
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;