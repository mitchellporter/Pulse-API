var mailer = require('nodemailer');
var logger = require('./logger');

function Emailer(options, callback) {
    this._options = options;
    this._transporter = mailer.createTransport(options);

    // verify connection configuration
    this._transporter.verify(function (err, success) {
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
    return new Promise(function(resolve, reject) {
        this._transporter.sendMail(message, function(err, info) {
            if (err) return reject(err);
            resolve(info);
        });
    }.bind(this));
}

module.exports = Emailer;