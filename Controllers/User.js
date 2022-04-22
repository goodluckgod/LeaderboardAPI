const UserModel = require('../Models/User');
const {Board} = require('../Configs/Lb');
const BoardUtils = require('../Utils/Lb');

const Create = async (req, res, next) => {
    try {
        const user = new UserModel(req.body);
        await user.save();
        BoardUtils.Add(user.username, 0).then(data => {
            res.send({user: {...user._doc, rank: data.rank, score: data.score}, message: 'User created'});
        });
    } catch (error) {
        next(error)
    }
}

const Read = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (user) {
            BoardUtils.GetRankAndScore(user.username).then(data => {
                res.send({user: {...user._doc, rank: data.rank, score: data.score}});
            });
        } else {
            throw new Object('User not found');
        }

    } catch (error) {
        next(error)
    }
}

const Update = async (req, res, next) => {
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (user && req.body.money) {
            BoardUtils.IncreaseMoney(user.username, req.body.money).then(data => {
                res.send({user: {...user._doc, rank: data.rank, score: data.score}, message: 'User updated'});
            })
        } else {
            throw new Object('User not found');
        }
    } catch (error) {
        next(error)
    }
}

const IncreaseMoney = async (req, res, next) => {
    try {
        if (!req.body.money) throw new Object('Money arg missing');

        const user = await UserModel.findById(req.params.id);
        
        if (user) {
            BoardUtils.IncreaseMoney(user.username, req.body.money).then(data => {
                res.send({user: {...user._doc, rank: data.rank, score: data.score}, message: 'User\'s money updated'});
            })
        } else {
            throw new Object('User not found');
        }
    } catch (error) {
        next(error)
    }
}
          

const Delete = async (req, res, next) => {
    try {
        await UserModel.findByIdAndDelete(req.params.id);
        res.send('User deleted');
    } catch (error) {
        next(error)
    }
}

const List = async (req, res, next) => {
    try {
        Board.list(req.params.page, async function(err, list) {
            if (err) {
                next(err);
            } else {
                const ResultList = [];
                await Promise.all(list.map(async (userData) => {
                    const user = await UserModel.findOne({username: userData.member});
                    if (user) {
                        const rank = await BoardUtils.GetRankAndScore(user.username);
                        ResultList[list.indexOf(userData)] = {...user._doc, rank: rank};
                    } else {
                        Board.rm(userData.member)
                    }
                }));

                const CurrentUser = await UserModel.findOne({username: req.body.username});

                if (CurrentUser) {
                    const CurrentUserBoard = await BoardUtils.GetRankAndScore(CurrentUser.username)
                    CurrentUserBoard.rank = CurrentUserBoard.rank;

                    if (CurrentUserBoard.rank > 100) {
                        if (CurrentUser) {
                            ResultList[CurrentUserBoard.rank - 1] = {...CurrentUser._doc, rank: CurrentUserBoard};
                        }
                    }

        
                    for (let i = 1; i < 4; i++) {
                        if (CurrentUserBoard.rank - i > 100 && i < 3) {
                    
                            const BellowUser = await BoardUtils.At(CurrentUserBoard.rank - i - 1);
                            const BellowUserData = await UserModel.findOne({username: BellowUser?.member});

                            if (BellowUserData) {
                                ResultList[BellowUser.rank - 1] = {...BellowUserData._doc, rank: BellowUser};
                               
                            }
                        } 


                        const AboveUser = await BoardUtils.At(CurrentUserBoard.rank + i - 1);
                        const AboveUserData = await UserModel.findOne({username: AboveUser?.member});
                        //console.log(AboveUser, CurrentUserBoard.rank + i - 1);
                        if (AboveUserData) {
                            ResultList[AboveUser.rank - 1] = {...AboveUserData._doc, rank: AboveUser};
                        }
                    }
                }
                


                res.send(ResultList.filter(element => {
                    return element !== null;
                }));
            }
        });
    } catch (error) {
        next(error)
    }
}

// Only for testing
const DeleteAll = async (req, res, next) => {
    try {
        await UserModel.deleteMany();
        Board.rmAll(async (err, success) => {
            if (err) {
                next(err);
            } else {
                try {
                    for (let i = 0; i < 100; i++) {
                        const user = new UserModel({username: `test${i}`, name: `test${i}`, country: 'TR'});
                        await user.save();
                        BoardUtils.Add(`User${i}`, 0);
                    }
                    res.send('All users deleted');
                } catch (error) {
                    next(error)
                }
            }
        });
    } catch (error) {
        next(error)
    }
}


UserController = {
    Create,
    Read,
    Update,
    Delete,
    List,
    DeleteAll,
    IncreaseMoney
}

module.exports = UserController