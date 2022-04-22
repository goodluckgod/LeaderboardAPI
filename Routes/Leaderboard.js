const express = require('express');
const router = express.Router();

const LeaderboardController = require('../Controllers/Leaderboard');

router.post('/Create', LeaderboardController.Create);
router.get('/TotalUsers', LeaderboardController.TotalUsers);
router.get('/Read', LeaderboardController.Read);
router.put('/Update/:id', LeaderboardController.Update);


module.exports = router;

