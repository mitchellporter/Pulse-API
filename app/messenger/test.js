const logger = require('../../lib/logger');
const messenger = require('./messenger');

messenger.sendMessage('nodejs_channel', 'sup dude from nodejs')
.then(function(response) {
    logger.silly('response: ' + response);
})
.catch(function(err) {
    logger.silly('error: ' + err);
})