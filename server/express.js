const startExpress = () => {
    const path = require('path');
    const express = require('express');
    const cors = require('cors');

    const userRouter = require(path.join(__dirname, 'routers', 'user.router'));
    const topicRouter = require(path.join(__dirname, 'routers', 'topic.router'));

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cors());

    app.use('', userRouter);
    app.use('', topicRouter);

    app.listen(process.env.EXPRESS_PORT, () => console.log('Express server is up on port', process.env.EXPRESS_PORT));
};

module.exports = startExpress;
