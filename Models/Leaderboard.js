const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    prizePool: {
        type: Number,
        required: true,
        default: 0
    },

});

const LeaderboardModel = mongoose.model('Leaderboard', LeaderboardSchema);

module.exports = LeaderboardModel;