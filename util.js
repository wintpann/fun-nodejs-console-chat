const parseMsg = msg => JSON.parse(msg);

const genMsg = msg => JSON.stringify(msg);

module.exports = {
    parseMsg,
    genMsg
};
