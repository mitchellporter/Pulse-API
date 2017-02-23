'use strict';

module.exports = {
	
	// Logging
	console_logging_enabled: true,
	winston_log_level: 'silly',
	
	// Services
	mongo_url: 'mongodb://localhost/pulse',
	
	// Concurrency
	web_concurrency: process.env.WEB_CONCURRENCY || 1
}