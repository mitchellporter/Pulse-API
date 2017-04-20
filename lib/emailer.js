const mailer = require('nodemailer');
const logger = require('./logger');

function Emailer(options, callback) {
    this._options = options;
    this._transporter = mailer.createTransport(options);

    // verify connection configuration
    this._transporter.verify( (err, success) => {
        if (err) {
            logger.silly(err);
            callback(err, null);
        } else {
            logger.silly('Emailer is ready to send emails!');
            callback(null, success);
        }
    });
};

Emailer.prototype.send = function(message) {
    return new Promise( (resolve, reject) => {
        this._transporter.sendMail(message, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        });
    });
}

module.exports = Emailer;