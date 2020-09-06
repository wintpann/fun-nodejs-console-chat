const path = require('path');
const { Socket } = require('net');
const dotenv = require('dotenv');
const inquirer = require('inquirer');
const { parseMsg, genMsg } = require(path.join(__dirname, '..', 'util'));
const sign = require(path.join(__dirname, 'sign'));
const topic = require(path.join(__dirname, 'topic'));

dotenv.config({path: path.join(__dirname, '..', '.env')});

const client = new Socket();
client.setEncoding('utf8');

client.on('error', () => {
    console.log('\n\x1b[31mAn error occurred!');
    client.destroy();
    process.exit();
});

const send = msg => client.write(genMsg(msg));

let messageQuestion = [];

const setMessageQuestion = () => {
    messageQuestion = [
        {
            type: 'input',
            name: 'message',
            message: `You: <${client.topic}>`,
            filter: val => {
                return val.trim()
            },
            validate: val => {
                return val.length > 0 ? true : 'Message is empty'
            }
        }
    ]
}

const typeMessage = () => {
    inquirer.prompt(messageQuestion).then(message => {
        if (message.message === '.exit') return client.destroy();
        if (message.message === '.users') message.action = 'users';
        send(message);
        typeMessage();
    })
};

const onMsg = msg => {
    if (msg.action === 'allowMessage') {
        console.clear();
        send({action: 'join'})
        setMessageQuestion();
        console.log('Type .exit to disconnect');
        console.log('Type .users to show all connected users');
        return typeMessage();
    }
    if (msg.action === 'close') return console.log(`\n\x1b[31m=== ${msg.client} disconnected ===`);
    if (msg.action === 'join') return console.log(`\n\x1b[32m=== ${msg.client} joined ===`);
    if (msg.action === 'users') return console.log(`\n\x1b[33m*** Connected users: ${msg.message} ***`);
    console.log(`\n\x1b[32m! \x1b[33m${msg.client}\x1b[0m: \x1b[34m<${client.topic}> \x1b[0m${msg.date} << \x1b[31m${msg.message}`);
};

client.on('data', data => onMsg(parseMsg(data)));

client.connect(8080, () => {
    sign(client)
        .then(auth => {
            console.clear();
            send({action: 'setAuth' ,token: auth.token, nickname: auth.nickname});
            topic()
                .then(topic => {
                    client.topic = topic;
                    send({action: 'setTopic', topic});
                })
                .catch(() => {
                    console.log('Internal server error. Try again later');
                    client.destroy();
                })
        })
        .catch(data => {
            const { client, error } = data;
            switch (error) {
                case 'serverError':
                    console.log('Internal server error. Try again later');
                    break;
                case 'invalidData':
                    console.log('Invalid data passed');
                    break;
                case 'userNotFound':
                    console.log('User not found');
                    break;
                case 'incorrectPassword':
                    console.log('Password is incorrect');
                    break;
            }
            client.destroy();
        })

});
