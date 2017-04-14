'use strict';

// source: http://stackoverflow.com/a/36316721/3344977
module.exports = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV === 'production')
        res.redirect('https://' + req.hostname + req.url)
    else
        next() /* Continue to other routes if we're not redirecting */
};