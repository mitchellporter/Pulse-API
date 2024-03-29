const logger = require('../../lib/logger');
const Standup = require('./standup');
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
    Standup
    .query()
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

    const standup = Standup.fromJson({ author: author.id, text: text });

    Standup
    .query()
    .insert(standup)
    .then(standup => {
        res.status(201).json({
            success: true,
            standup: standup
        });
    })
    .catch(next);

};
