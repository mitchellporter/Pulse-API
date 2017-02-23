'use strict';

module.exports = {
	
	// Logging
	console_logging_enabled: process.env.CONSOLE_LOGGING_ENABLED,
	winston_log_level: process.env.WINSTON_LOG_LEVEL,
	
	// Services
	mongo_url: process.env.MONGODB_URI,
	
	// Concurrency
	web_concurrency: process.env.WEB_CONCURRENCY
};