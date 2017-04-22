'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')('dev');
const www_redirect = require('./wwwRedirect');
const ssl_redirect = require('./sslRedirect');

module.exports = function(app) {
    app.use(www_redirect);
    app.use(ssl_redirect);
    app.use(morgan);
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(mquery.middleware({ limit:10, maxLimit:50 }));
};