var mailer = require('nodemailer');

function Emailer(options, callback) {
    this._options = options;
    this._transporter = mailer.createTransport(options);

    // verify connection configuration
    this._transporter.verify(function (err, success) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            console.log('Server is ready to take our messages');
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