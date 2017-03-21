'use strict';

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
	
	// middleware
	app.set('x-powered-by', false);
	app.use(require('morgan')('dev'));
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	
	// routes
	app.use('/api/' + config.api_version, api);
	
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