const { Schema, model } = require('mongoose');

const topicSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    }
});


module.exports = model('Topic', topicSchema);
