//'use strict';

var _ = require('lodash');

var config = {
	dev: 'development',
	prod: 'production',
	port: process.env.PORT || 3000,
	api_version: process.env.API_VERSION || 'v1',
	expireTime: 24 * 60 * 10, // 10 days in minutes
	secrets: {
		jwt: process.env.JWT_KEY || 'KjVhXGSR1RKsK+ySQxKdoI1UqaRPtCWyC9b462G+s24='
	}
}

process.env.NODE_ENV = process.env.NODE_ENV || config.dev;
config.env = process.env.NODE_ENV;
var envConfig = require('./' + config.env + '.js');

module.exports = _.merge(config, envConfig);