const LeaderboardModel = require('../Models/Leaderboard');
const Board = require('../Utils/Lb');

const Create = async (req, res, next) => {
    try {
        const leaderboard = new LeaderboardModel();
        await leaderboard.save();
        res.json({message: 'Created', ...leaderboard});
    } catch (error) {
        next(error)
    }
}

const Read = async (req, res, next) => {
    try {
        const leaderboard = await LeaderboardModel.findOne({});
        if (!leaderboard) {
            Create(req, res, next);
        } else {
            res.json({"data": leaderboard, message: 'Readed'});
        }
    } catch (error) {
        next(error)
    }
}

const Update = async (req, res, next) => {
    try {
        const leaderboard = await LeaderboardModel.findOne({});
        if (!leaderboard) {
            Create(req, res, next);
        } else {
            leaderboard.prizePool = req.body.prizePool;
            await leaderboard.save();
            res.json({message: 'Updated', ...leaderboard});
        }
    } catch (error) {
        next(error)
    }
}

const TotalUsers = async (req, res, next) => {
    try {
        Board.Total(function(err, number) {
            if (err) {
                next(err);
            } else {
                res.json({total: number});
            }
        });
    } catch (error) {
        next(error)
    }
}

LeaderboardController = {
    Create,
    Read,
    Update,
    TotalUsers
}

module.exports = LeaderboardController