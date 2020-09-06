const path = require('path');
const Topic = require(path.join(__dirname, '..', 'models', 'topic.model'));

const createTopic = async (req, res) => {
    try {
        const topic = await Topic.create(req.body);
        res.status(201).json({topic})
    } catch (e) {
        if (e.message && e.message.slice(0, 20) === 'E11000 duplicate key') return res.status(409).json({error: e});
        res.status(400).json({error: e});
    }
};

const getAllTopics = async (req, res) => {
    try {
        let topics = await Topic.find().select('-__v -_id -messages');
        topics = topics.map(topic => topic.title);
        res.json({topics});
    } catch (e) {
        res.status(400).json({error: e});
    }
}

module.exports = {
    createTopic,
    getAllTopics
}
