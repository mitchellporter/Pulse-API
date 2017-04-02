'use strict';

module.exports = {
	
	// Logging
	console_logging_enabled: true,
	winston_log_level: 'silly',

	// URL
	base_url: 'http://localhost:3000/',

	// Email
	from_email: 'ellroiapp@gmail.com',
	formatted_from_email: 'Ellroi <ellroiapp@gmail.com>',
	gmail_password: 'kirkland1234',
	
	// Services
	mongo_url: 'mongodb://localhost/pulse',
	
	// Concurrency
	web_concurrency: process.env.WEB_CONCURRENCY || 1,

	secrets: {
		jwt: process.env.JWT_KEY || 'TL9rQ9VSxG4MGk+FleLXrcT6r6819YwuxIhCF+On2pE='
	},
}