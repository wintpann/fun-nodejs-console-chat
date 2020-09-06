const path = require('path');
const { Router } = require('express');
const router = Router();

const controller = require(path.join(__dirname, '..', 'controllers', 'topic.controller'));

router.post('/topics', controller.createTopic);
router.get('/topics', controller.getAllTopics);

module.exports = router;
