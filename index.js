'use strict';
var path = require('path');
var config = require('./config/config');
var logger = require('./lib/logger');
var errors = require('./lib/errors');
var throng = require('throng');
var Promise = require('bluebird');
var mongoose = require('mongoose').connect(config.mongo_url);
mongoose.Promise = Promise;

var api = require('./app/api/api');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var options = {
	workers: config.web_concurrency,
	lifetime: Infinity
}

throng(options, start);

function start() {
	
	app.set('x-powered-by', false);

	// TODO: Move this to its own module
	// source: http://stackoverflow.com/a/23816083/3344977
	function wwwRedirect(req, res, next) {
		if (req.headers.host.slice(0, 4) === 'www.') {
			var newHost = req.headers.host.slice(4);
			return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
		}
		next();
	};

	app.set('trust proxy', true);
	app.use(wwwRedirect);

	// middleware
	app.use(require('morgan')('dev'));
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	
	// routes
	app.use('/api/' + config.api_version, api);

	// web routes
	app.use('/', require('./web/routes'));
	
	// errors
	app.use(errors);
	
	// Server setup
	var server = app.listen(config.port, function() {
		console.log('server server server');
		logger.silly('pid: ' + process.pid + ' listening on port:' + config.port);
	});
	
	// Shutdown
	var gracefulShutdown = function() {
		logger.silly('Received SIGTERM signal, shutting down express server');
		server.close();
	}
	
	process.on('SIGTERM', gracefulShutdown);
		
	server.on('close', function() {
		logger.silly('Express server closed.. about to cleanup connections');
		
		mongoose.disconnect();
	});
}