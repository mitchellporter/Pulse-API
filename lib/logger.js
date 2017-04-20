'use strict';

const config = require('../config/config');
const winston = require('winston');

// Create custom logger
var logger = new winston.Logger({
	level: config.winston_log_level,
	colorize: 'all'
});

// Add transports for production
if (config.env === config.prod) {
	
	if (config.console_logging_enabled === 'true') {
		// Add console to custom logger
		logger.add(winston.transports.Console, {
			level: config.winston_log_level
		});
	}

} else {

	// Add console to custom logger
	logger.add(winston.transports.Console, {
		level: config.winston_log_level
	});
}

module.exports = logger;