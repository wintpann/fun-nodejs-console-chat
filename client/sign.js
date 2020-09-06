const inquirer = require('inquirer');
const superagent = require('superagent');
const { camelCase } = require('change-case');

const sign = client => {
    return new Promise((resolve, reject) => {
        const signMethodQuestion = [
            {
                type: 'list',
                name: 'signMethod',
                message: 'Do you want to Sign up or Log in?',
                choices: ['Sign up', 'Log in'],
                filter: val => {
                    return camelCase(val);
                }
            }
        ];

        inquirer.prompt(signMethodQuestion).then(signAnswer => {
            let signQuestions;
            if (signAnswer.signMethod === 'signUp') {
                signQuestions = [
                    {
                        type: 'input',
                        name: 'nickname',
                        message: 'Come up with your unique nickname >>',
                        filter: val => {
                            return val.trim();
                        },
                        validate: async val => {
                            try {
                                const users = await superagent.get(process.env.URL + '/users');
                                if (users.body.find(user => user.nickname === val)) return 'Nickname already taken';
                                return true;
                            } catch (e) {
                                return 'Seems like server is down. Try to sign up later';
                            }

                        }
                    },
                    {
                        type: 'password',
                        name: 'password',
                        message: 'Your extra strong password >>',
                        filter: val => {
                            return val.trim();
                        },
                        validate: val => {
                            return val.length > 0 ? true : 'Enter at least one symbol';
                        }
                    }
                ]
            } else {
                signQuestions = [
                    {
                        type: 'input',
                        name: 'nickname',
                        message: 'Your nickname >>',
                        filter: val => {
                            return val.trim();
                        },
                        validate: val => {
                            return val.length > 0 ? true : 'Enter nickname';
                        }
                    },
                    {
                        type: 'password',
                        name: 'password',
                        message: 'Your password >>',
                        filter: val => {
                            return val.trim();
                        },
                        validate: val => {
                            return val.length > 0 ? true : 'Enter password';
                        }
                    }
                ]
            }
            inquirer.prompt(signQuestions).then(user => {
                if (signAnswer.signMethod === 'signUp') {
                    try {
                        superagent.post(process.env.URL + '/signup').send(user).end((err, res) => {
                            if (err) {
                                console.log('Seems like server is down. Try to sign up later');
                                const data = {client, error: 'invalidData'}
                                return reject(data);
                            }
                            client.token = res.body.token;
                            return resolve({token: res.body.token, nickname: res.body.nickname});
                        });
                    } catch (e) {
                        const data = {client, error: 'serverError'}
                        return reject(data);
                    }
                } else {
                    try {
                        superagent.post(process.env.URL + '/login').send(user).end((err, res) => {
                            if (err) {
                                let error;
                                if (err.status === 404) error = 'userNotFound'
                                else if (err.status === 403) error = 'incorrectPassword'
                                else error = 'serverError';
                                const data = {client, error}
                                return reject(data);
                            }
                            return resolve({token: res.body.token, nickname: res.body.nickname});
                        });
                    } catch (e) {
                        const data = {client, error: 'serverError'}
                        return reject(data);
                    }
                }
            })
        })
    })
}

module.exports = sign;
