const startSocket = () => {
    const path = require('path');
    const net = require('net');
    const jwt = require('jsonwebtoken');
    const moment = require('moment');
    const { parseMsg, genMsg } = require(path.join(__dirname, '..', 'util'));

    const server = net.createServer();

    const clients = [];

    const sendToClient = (msg, client) => {
        client.write(genMsg(msg));
    };

    const sendToTopic = (msg, client) => {
        msg.client = client.nickname;
        msg.date = moment().format('hh:mm:ss')
        clients.forEach(c => {
            if (c.topic === client.topic && c.nickname !== client.nickname) {
                sendToClient(msg, c);
            }
        })
    };

    const verifyClient = client => {
        if (client) {
            try {
                jwt.verify(client.token, process.env.JWT_SECRET);
            } catch (e) {
                client.destroy();
            }
        } else {
            client.destroy();
        }
    };

    const onMsg = async (msg, client) => {
        if (msg.action === 'setAuth') {
            client.token = msg.token
            client.nickname = msg.nickname;
            return;
        }
        verifyClient(client);
        if (msg.action === 'setTopic') {
            client.topic = msg.topic;
            clients.push(client);
            return sendToClient({action: 'allowMessage'}, client)
        }
        if (msg.action === 'users') {
            return sendToClient({action: 'users', message: clients.filter(c => c.topic === client.topic && c.nickname !== client.nickname).map(c => c.nickname)}, client);
        }
        sendToTopic(msg, client);
    };

    server.on('connection', socket => {
        socket.setEncoding('utf8');

        socket.on('data', data => onMsg(parseMsg(data), socket));

        socket.on('close', () => {
            const idx = clients.findIndex(c => c.nickname === socket.nickname);
            clients.splice(idx, 1);
            sendToTopic({action: 'close'}, socket)
        });

        socket.on('error', () => socket.destroy());
    });

    server.listen(process.env.SOCKET_PORT, () => console.log('Socket server is up on port', process.env.SOCKET_PORT));
}

module.exports = startSocket;
