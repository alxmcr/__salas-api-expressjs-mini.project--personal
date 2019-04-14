const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name field is required']
    },
    lastname: {
        type: String,
        required: [true, 'lastname field is required']
    },
    email: {
        type: String,
        required: [true, 'email field is required']
    },
    username: {
        type: String,
        required: [true, 'username field is required']
    },
    password: {
        type: String,
        required: [true, 'password field is required']
    },
    image: {
        type: String,
        default: 'https://image.flaticon.com/icons/svg/158/158420.svg'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

// Middleware: POST
UserSchema.post('findOneAndDelete', function(user) {
    console.log('%s has been findOneAndDelete', user._id);
});

const User = mongoose.model('User', UserSchema);

module.exports = User;