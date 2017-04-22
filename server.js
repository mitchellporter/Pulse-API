'use strict';

const config = require('./config/config');
const logger = require('./lib/logger');
const middleware = require('./lib/middleware');
const errors = require('./lib/errors');
const throng = require('throng');
const Promise = require('bluebird');
const mongoose = require('mongoose').connect(config.mongo_url);
mongoose.Promise = Promise;

const mquery = require('express-mquery');
mongoose.plugin(mquery.plugin, { limit:10 });

const api = require('./app/api/api');
const express = require('express');
const app = express();

const options = {
	workers: config.web_concurrency,
	lifetime: Infinity
}

throng(options, start);

function start() {
	
	app.set('x-powered-by', false);
	app.set('trust proxy', true);

	// middleware
	// app.use(mquery.middleware({limit:10, maxLimit:50}));
	middleware(app);
	
	// routes
	app.use('/api/' + config.api_version, api);

	// web routes
	app.use('/', require('./web/routes'));
	
	// errors
	app.use(errors);
	
	// Server setup
	var server = app.listen(config.port, () => {
		logger.silly('pid: ' + process.pid + ' listening on port:' + config.port);
	});
	
	// Shutdown
	var gracefulShutdown = () => {
		logger.silly('Received SIGTERM signal, shutting down express server');
		server.close();
	}
	
	process.on('SIGTERM', gracefulShutdown);
		
	server.on('close', () => {
		logger.silly('Express server closed.. about to cleanup connections');
		
		mongoose.disconnect();
	});
}