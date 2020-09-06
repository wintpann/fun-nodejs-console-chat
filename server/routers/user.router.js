const path = require('path');
const { Router } = require('express');
const router = Router();

const controller = require(path.join(__dirname, '..', 'controllers', 'user.controller'));

router.get('/users', controller.getAllUsers);
router.post('/signup', controller.signup);
router.post('/login', controller.login);

module.exports = router;
