'use strict';

const config = require('./config/config');
const logger = require('./lib/logger');
const middleware = require('./lib/middleware');
const errors = require('./lib/errors');
const knex = require('knex')(require('./knexfile')['production']);
const Model = require('objection').Model;
const Promise = require('bluebird');

const api = require('./app/api/api');
const express = require('express');
const app = express();

Model.knex(knex);

app.set('x-powered-by', false);
app.set('trust proxy', true);

// middleware
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