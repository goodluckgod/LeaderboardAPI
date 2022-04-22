const express = require('express');
const router = express.Router();

const UserController = require('../Controllers/User');

router.post('/Create', UserController.Create);
router.get('/Read/:id', UserController.Read);
router.put('/Update/:id', UserController.Update);
router.delete('/Delete/:id', UserController.Delete);
router.put('/IncreaseMoney/:id', UserController.IncreaseMoney);
router.get('/List', UserController.List);
router.get('/List/:username', UserController.List);
// Only for testing
router.delete('/DeleteAll', UserController.DeleteAll);

module.exports = router;
