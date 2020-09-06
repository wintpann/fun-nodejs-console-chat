const inquirer = require('inquirer');
const superagent = require('superagent');
const { camelCase } = require('change-case');

const topic = () => {
    return new Promise(async (resolve, reject) => {
        let isAnyTopic = false;
        try {
            const data = await superagent.get(process.env.URL + '/topics');
            if (data.body.topics.length > 0) isAnyTopic = true;
        } catch (e) {
            reject();
        }

        const topicConnectQuestion = [
            {
                type: 'list',
                name: 'topicConnect',
                message: 'Do you want to join to existing topic or create a new one?',
                choices: ['Join', 'Create new'],
                filter: val => {
                    if (!isAnyTopic) return 'createNew';
                    return camelCase(val);
                }
            }
        ];

        inquirer.prompt(topicConnectQuestion).then(connectAnswer => {
            if (connectAnswer.topicConnect === 'createNew') {
                const newTopicQuestion = [
                    {
                        type: 'input',
                        name: 'title',
                        message: isAnyTopic ? 'Enter topic title >>' : 'There are no any topics yet. Create first one >>',
                        filter: val => {
                            return val.trim();
                        },
                        validate: async val => {
                            if (!val) return 'Enter at least one symbol';
                            try {
                                const data = await superagent.get(process.env.URL + '/topics');
                                if (data.body.topics.find(topic => topic.title === val)) return 'Topic already exists';
                                return true;
                            } catch (e) {
                                return 'Seems like server is down. Try to sign up later';
                            }
                        }
                    }
                ]
                
                inquirer.prompt(newTopicQuestion).then(async topic => {
                    try {
                        const data = await superagent.post(process.env.URL + '/topics').send(topic);
                        return resolve(data.body.topic.title);
                    } catch (e) {
                        return reject();
                    }
                })
            } else {
                superagent.get(process.env.URL + '/topics').end((err, res) => {
                    if (err) return reject();
                    
                    const topics = res.body.topics;
                    const topicQuestion = [
                        {
                            type: 'list',
                            name: 'topic',
                            message: 'Choose topic',
                            choices: topics
                        }
                    ];
                    inquirer.prompt(topicQuestion).then(topic => {
                        resolve(topic.topic);
                    })
                })
            }
        })
    })
}

module.exports = topic;
