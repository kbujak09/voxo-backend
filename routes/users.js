const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.get('/users', userController.getUsers);

router.get('/users/id/:userId', userController.getUserById);

router.get('/users/username/:username', userController.getUserByUsername);

module.exports = router;