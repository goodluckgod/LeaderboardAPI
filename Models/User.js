const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true,
        validate: [validator.isISO31661Alpha2, 'Invalid country code, please use ISO 3166-1 alpha-2 Example: TR']
    },
    avatarUrl: {
        type: String,
        validate: [validator.isURL, 'Invalid avatar url']
    },
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;