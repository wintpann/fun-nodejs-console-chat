const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'PasswordShouldExist']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.isPasswordCorrect = async function (candidate) {
    return await bcrypt.compare(candidate, this.password);
};

module.exports = model('User', userSchema);
