const path = require('path');
const jwt = require('jsonwebtoken');
const User = require(path.join(__dirname, '..', 'models', 'user.model'));

const signup = async (req, res) => {
    try {
        const user = await User.create(req.body);
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({ token, nickname: user.nickname });
    } catch (e) {
        res.status(400).json({ error: e });
    }
};

const login = async (req, res) => {
    try {
        const user = await User.findOne({ nickname: req.body.nickname });
        if (!user) return res.status(404).json({ error: 'UserNotFound' });
        if (!await user.isPasswordCorrect(req.body.password)) return res.status(403).json({ error: 'IncorrectPassword' });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({ token, nickname: user.nickname });
    } catch (e) {
        res.status(400).json({ error: e });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -createdAt');
        res.json(users);
    } catch (e) {
        res.status(400).json({ error: e });
    }
};

module.exports = {
    signup,
    login,
    getAllUsers
}
