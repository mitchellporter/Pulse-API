const logger = require('../../lib/logger');
const Standup = require('./standupModel');
const async = require('async');

exports.params = function(req, res, next, id) {
    Standup.findById(id)
    .then(standup => {
        if (!standup) return next(new Error('no standup exists with that id'));
        req.standup = standup;
        next();
    })
    .catch(next);
};

exports.get = function(req, res, next) {

    var query = {};
	if (req.query.author) query.author = req.query.author
	
    Standup.find(query)
    .populate('author', '_id name email position avatar_url')
    .then(standups => {
        res.status(200).json({
            success: true,
            standups: standups
        });
    })
    .catch(next);
};

exports.getOne = function(req, res, next) {
    const standup = req.standup;
    res.status(200).json({
        success: true,
        standup: standup
    });
};

exports.post = function(req, res, next) {
    const author = req.user;
    const text = req.body.text;

    var standup = new Standup({
        text: text,
        author: author
    });

    standup.save()
    .then(standup => {
        res.status(201).json({
            success: true,
            standup: standup
        });
    })
    .catch(next);
};

// TODO: PUT and DELETE?