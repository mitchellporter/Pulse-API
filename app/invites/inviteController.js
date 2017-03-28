var logger = require('../../lib/logger');
var async = require('async');
var _ = require('lodash');
var Invite = require('./inviteModel');


exports.post = function(req, res, next) {
    var sender = req.user;
    var team = req.team; // optional
    var task = req.task; // optional

    var type;
    if (team) type = 'team';
    if (task) type = 'task';

    var invitees = req.body.invitees;

    var invites = [];
    async.forEachOf(invitees, function(value, key, callback) {
        var invitee = value;
        var invite = new Invite({
            sender: sender,
            type: type,
            name: invitee.name,
            email: invitee.email,
            team: team,
            task: task
        });
        invites.push(invite);
        callback();
    }, function(err) {
        if (err) return next(err);
        
        Invite.create(invites)
        .then(function(invites) {
            res.status(201).json({
                success: true,
                invites: invites
            });
        })
        .catch(next);
    });

    function sendInvites(invites) {
        async.forEachOf(invites, function(value, key, callback) {
            var invite = value;
            invite.send()
            .then(function(res) {
                callback();
            })
            .catch(callback);
        }, function(err) {
            if (err) return logger.error(err);
            logger.silly('successfully sent invite emails');
        });
    }
};