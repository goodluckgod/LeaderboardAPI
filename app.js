const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 3000

const app = express();

require('./Configs/Db');

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// API v1 Routes
app.use('/api/v1/leaderboard', require('./Routes/Leaderboard'));
app.use('/api/v1/user', require('./Routes/User'));

app.use((err, req, res, next) => {
    if (err) {
        console.error(err)
        res.status(500).json(err);
    } else {
        res.status(404).send('Not Found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);   
})

const BoardUtils = require('./Utils/Lb');
const UserModel = require('./Models/User');
const { Board } = require('./Configs/Lb');

app.use('/eow', (req, res, next) => {
    BoardUtils.EOW();
    res.send('EOW');
});

app.use('/unionY', (req, res, next) => {
    Board.unionY();
    res.send('UnionY');
});

// Test Section

// const Create = async (i) => {
//     try {
//         const user = new UserModel({username: `test${i}`, name: `test${i}`, country: 'TR'});
//         await user.save();
//         BoardUtils.Add("test" + i, 0).then(data => {
            
//         });
//     } catch (error) {
//         console.log(error)
//     }
// }

// for (let i = 0; i < 100; i++) {
//  Create(i)   
// }

// Cronjobs

const { CronJob } = require('cron');

const DailyReset = new CronJob('0 0 * * *', Board.unionY);
DailyReset.start();

const EOWPrize = new CronJob('0 0 * * 1', BoardUtils.EOW);
EOWPrize.start();
