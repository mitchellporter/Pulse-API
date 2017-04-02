'use strict';

module.exports = {
	
	// Logging
	console_logging_enabled: process.env.CONSOLE_LOGGING_ENABLED,
	winston_log_level: process.env.WINSTON_LOG_LEVEL,

	// URL
	base_url: process.env.BASE_URL,

	// Email
	from_email: process.env.FROM_EMAIL,
	gmail_password: process.env.GMAIL_PASSWORD,
	
	// Services
	mongo_url: process.env.MONGODB_URI,
	
	// Concurrency
	web_concurrency: process.env.WEB_CONCURRENCY
};