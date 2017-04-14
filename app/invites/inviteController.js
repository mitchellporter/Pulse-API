var logger = require('../../lib/logger');
var async = require('async');
var _ = require('lodash');
var Invite = require('./inviteModel');
var User = require('../users/userModel');
var TaskInvitation = require('../task_invitations/taskInvitationModel');
var signToken = require('../auth/auth').signToken;

exports.params = function(req, res, next, id) {
    Invite.findById(id)
	.populate({ path: 'task', populate: { path: 'assigner', select: '_id name position email avatar_url' }}) // task.assigner
    .then((invite) => {
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
    .then((invite) => {
        response.invite = invite;
        return createUser(req.body);
    })
    .then((user) => {
        response.user = user;
        response.token = signToken(user._id);
        return addUserToTaskAssignees();
    })
    .then((task) => {
        res.status(200).json(response);
    })
    .catch(next);

    function createUser(body) {
        logger.silly('body: ' + Object.keys(body));
        return new Promise((resolve, reject) => {
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

    function addUserToTaskAssignees() {

        task.isNew = false;
        task.assignees.push(response.user);
        return task.save();

    }

    function alreadyAccepted() {
        logger.silly('invite already accepted - just return existing user + fesh token');
        logger.silly('email: ' + invite.email);
        User.findOne({ email: invite.email })
            .then((user) => {

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

// Create task_invitations
// Create app invites which can have a task_invitation property
// Now the user has a task_invitation property that they can reference

exports.post = function(req, res, next) {

    logger.silly('about to create invites');

    var sender = req.user;
    var team = sender.team; // optional
    var task = req.task; // optional

    var type = 'task';
    // if (team) type = 'team';
    // if (task) type = 'task';

    var invitees = req.body.invitees;

    createTaskInvitations()
    .then(createInvites)
    .then((invites) => {
            res.status(201).json({
                success: true,
                invites: invites
            });

            // Send invites
            Invite.send(invites)
            .then(() => {
                    logger.silly('successfully sent emails to all invitees');
            })
            .catch(logger.error)
    })
    .catch(next);

    function createInvites(task_invitations) {
        var invites = [];
        return new Promise((resolve, reject) => {
            async.forEachOf(invitees, (value, key, callback) => {

                var invitee = value;
                var invite = new Invite({
                    sender: sender,
                    type: type,
                    name: invitee.name,
                    email: invitee.email,
                    team: team,
                    task: task,
                    task_invitation: task_invitations[key]
                });
                invites.push(invite);
                callback();
            }, (err) => {
                if (err) return reject(err);

                Invite.create(invites)
                .then(resolve)
                .catch(reject);
            });
        });
    }

    function createTaskInvitations() {
        var task_invitations = [];
        return new Promise((resolve, reject) => {
            async.forEachOf(invitees, (value, key, callback) => {
                var invitee = value;
                var task_invitation = new TaskInvitation({
                    sender: sender,
                    task: task
                });
                task_invitations.push(task_invitation);
                callback();
            }, (err) => {
                if (err) return reject(err);

                TaskInvitation.create(task_invitations)
                    .then(resolve)
                    .catch(reject);
            });
        })
    };
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