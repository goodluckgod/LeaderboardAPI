const {Board} = require('../Configs/Lb');
const LeaderboardModel = require('../Models/Leaderboard');
const UserModel = require('../Models/User');

const GetRankAndScore = async (username) => {
    return new Promise((resolve, reject) => {
        Board.rank(username, function(err, rank) {
            if (err) {
                reject(err);
            } else {
                Board.score(username, function(err, score) {
                    if (err) {
                        reject(err);
                    } else {
                        Board.rankY(username, function(err, prevRank) {
                            if (err) {
                                reject(err);
                            } else {
                                prevRank = prevRank <= 0 ? rank : prevRank;
                                resolve({rank: rank+1, prevRank: prevRank + 1, score: parseInt(score)});
                            }
                        });
                    }
                });
            }
        });
    });
}

const IncreaseMoney = async (username, money, pool) => {
    return new Promise((resolve, reject) => {
        money = pool !== false ? money * 0.98 : money;
        Board.incr(username, parseInt(Math.floor(money)), function(err) {
            if (err) {
                reject(err);
            } else {
                if (pool !== false) {
                    IncreasePoolMoney(Math.floor(money * 0.02));
                }

                GetRankAndScore(username).then(data => {
                    resolve(data);
                });
            }
        });
    });
}

const Add = async (username, money) => {
    return new Promise((resolve, reject) => {
        Board.add(username, money, function(err) {
            if (err) {
                reject(err);
            } else {
                GetRankAndScore(username).then(data => {
                    resolve(data);
                });
            }
        });
    });
}

const At = async (index) => {
    return new Promise((resolve, reject) => {
        Board.at(index, function(err, data) {
            if (err) {
                reject(err);
            } else {
                if (data) {
                    GetRankAndScore(data.member).then(rank => {
                        resolve({member: data.member, ...rank});
                    });
                } else {
                    resolve({});
                }
            
            }
        });
    });
}

const IncreasePoolMoney = (money) => {
    LeaderboardModel.findOneAndUpdate({}, { $inc: { prizePool: money } }, { new: true }, (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            console.log(doc);
        }
    });
}

// Distrubute prize pool on end of the week
const EOW = () => {
    LeaderboardModel.findOne({}, (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            Board.list(0, async (err, users) => {
                users.forEach(async (user, i) => {
                    doc.prizePool = 10000

                    user = await UserModel.findOne({username: user.member});
                    
                    if (!user) return;
            
                    // Give 20%, 15%, 10% of the prize pool to the first three user
                    if (i === 0) {
                        IncreaseMoney(user.username, Math.floor(doc.prizePool * 0.2), false);
                    } else if (i === 1) {
                        IncreaseMoney(user.username, Math.floor(doc.prizePool * 0.15), false);
                    } else if (i === 2) {
                        IncreaseMoney(user.username, Math.floor(doc.prizePool * 0.10), false);
                    } else {
                        const prize = doc.prizePool * (1.1326 - (0.012 * (i - 3))) / 100
                        IncreaseMoney(user.username, Math.floor(prize), false);
                    }
                });
            })
        }

        doc.prizePool = 0
        doc.save();
    })
}

module.exports = {
    GetRankAndScore,
    IncreaseMoney,
    Add,
    At,
    Total: Board.total,
    EOW
}