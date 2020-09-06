const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path: path.join(__dirname, '..', '.env')});

const startExpress = require(path.join(__dirname, 'express'));
const startSocket = require(path.join(__dirname, 'socket'));

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('DB CONNECTED');
        startExpress();
        startSocket();
    })
    .catch(e => {
        console.error('CONNECTING DB ERROR >>', e);
        process.exit();
    });
