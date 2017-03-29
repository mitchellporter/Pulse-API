var logger = require('../../lib/logger');
var async = require('async');
var _ = require('lodash');
var Invite = require('./inviteModel');
var User = require('../users/userModel');
var signToken = require('../auth/auth').signToken;

exports.params = function(req, res, next, id) {
    Invite.findById(id)
    .then(function(invite) {
        if (!invite) return next(new Error('No invite exists with that id'));

        // TODO: Uncomment this later on when we have a functioning site
        // if (invite.status == 'accepted') return next(new Error('This invite has already been accepted'));

        req.invite = invite;
        next();
    })
    .catch(next);
};

exports.put = function(req, res, next) {
    logger.silly('status: ' + req.body.status);

    var status = req.body.status;
    var task = req.task;
    var invite = req.invite;
    var response = { success: true };

    // TODO: Hack - If already accepted, just fetch their existing user object + return fresh token 
    // Remove this once we have functioning site login
    if (invite.status == 'accepted') return alreadyAccepted();
    
    invite.status = 'accepted';
    invite.isNew = false;
    invite.save()
    .then(function(invite) {
        response.invite = invite;
        return createUser(req.body);
    })
    .then(function(user) {
        response.user = user;
        response.token = signToken(user._id);
        res.status(200).json(response);
    })
    .catch(next);

    function createUser(body) {
        logger.silly('body: ' + Object.keys(body));
        return new Promise(function(resolve, reject) {
            var user = new User({
                name: body.name,
                password: body.password,
                email: invite.email,
                position: body.position,
                team: invite.team
            });

            user.save()
            .then(resolve)
            .catch(reject);
        });
    }

    function alreadyAccepted() {
        logger.silly('invite already accepted - just return existing user + fesh token');
        logger.silly('email: ' + invite.email);
        User.findOne({ email: invite.email })
            .then(function (user) {

                res.status(200).json({
                    success: true,
                    invite: invite,
                    user: user,
                    token: signToken(user._id)
                });
            })
            .catch(next);
    }
};  

exports.post = function(req, res, next) {
    var sender = req.user;
    var team = sender.team; // optional
    var task = req.task; // optional

    var type = 'task';
    // if (team) type = 'team';
    // if (task) type = 'task';

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

            Invite.send(invites)
            .then(function() {
                logger.silly('successfully sent emails to all invitees');
            })
            .catch(logger.error)
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

exports.getOne = function(req, res, next) {
    var task = req.task;
    var invite = req.invite;

    res.status(200).json({
        success: true,
        task: task,
        invite: invite
    });
};