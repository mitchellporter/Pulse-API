'use strict';

const logger = require('./logger');

function errorHandler(err, req, res, next) {
	logger.error(err);
	res.status(500).json({
		success: false,
		error: err.message
	})
};

module.exports = errorHandler;