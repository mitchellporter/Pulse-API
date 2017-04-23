'use strict'

const async = require('async');
const _ = require('lodash');
const casual = require('casual');
const faker = require('faker');
const Promise = require('bluebird');
const config = require('../config/config');
const mongoose = require('mongoose').connect(config.mongo_url);
mongoose.Promise = Promise;

const logger = require('../lib/logger');
const Team = require('../app/teams/teamModel');
const User = require('../app/users/userModel');
const Project = require('../app/projects/projectModel');
const ProjectInvitation = require('../app/project_invitations/projectInvitationModel');
const Task = require('../app/tasks/taskModel');
const TaskInvitation = require('../app/task_invitations/taskInvitationModel');
const Subtask = require('../app/subtasks/subtaskModel');
const Update = require('../app/updates/updateModel');
const UpdateRequest = require('../app/update_requests/updateRequestModel');
const Standup = require('../app/standups/standupModel');

// Assets
const cdn_url = 'https://d33833kh9ui3rd.cloudfront.net/';
const asset_file_format = '.png';
const avatar_asset_names = ['AllisonReynolds', 'DinaAlexander', 'DylanMcKay', 'EddieGelfen', 'EllenJosephineHickle', 'Iggy', 'Lisa', 'Oblina', 'PeteWrigley',
    'RichardWang', 'Rufio', 'SamEmerson', 'ScottHoward', 'SimonHolmes', 'TinaCarlyle', 'WillSmith'];

const positions = ['iOS Developer', 'Android Developer', 'Mobile Designer', 'Web Designer', 'Devops', 'Database Engineer', 'Customer Service Rep', 'Sales / Marketing', 'CEO'];
const task_titles = ['Design the new navigation icons for the mobile app', 'We need a basic marketing website for the new app can', 'We need to review resumes for new Android developers'];
const item_titles = ['Needs, Sign up button, place to input email address, or phone number.', 'Make sure to hi-light the press we recieved (Time, Inc. NYT.)', 'Show screen shots of the app in action.', 'Nice big hero image at the top.'];

// Permanent dummy users
const dummy_user_kori_id = '585c2130f31b2fbff4efbf68';
const kori_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/kori.png';
const kori_standup_id = '58f91d90afcf2363f3276ec6';

const dummy_user_mitchell_id = '586ecdc0213f22d94db5ef7f';
const mitchell_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/mitchell.png';
const mitchell_standup_id = '58f91daaafcf2363f3276ec7';

const dummy_user_allen_id = '5881130a387e980f48c743f7';
const allen_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/allen.png';
const allen_standup_id = '58f91dccafcf2363f3276ec8';

const dummy_user_arch_id = '58c70df6105bd171feeb2cbc';
const arch_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/arch.png'
const arch_standup_id = '58f91dffdd093264618d3ae5';

const dummy_user_mike_id = '58f8ef49de159c22a4d19fd1';
const mike_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/mike.png';
const mike_standup_id = '58f91e00dd093264618d3ae6';

const standup_text = 'Today I did several things to the iOS app:\n\n1. I replaced the old launch screen image with the new image\n2. I added and setup the Crashlytics SDK\n3. I added the new app icons\n';

// 1 day in ms, 2 days, ... 
const dummy_task_due_dates = [Date.now() + 86400000, Date.now() + 172800000, Date.now() + 259200000, Date.now() + 345600000];

const pending_task_id = '58d6b31c2d424a133faba773';
const in_progress_task_id = '586ebcae9188e7b6bfdd85c4';
const task_invitation_id = '58bf269e9b5a8ff83f9a94e2';
const team_id = '58b080b2356e913f3a3af182';
const item_id = '58b09c7c247aa67459185307';
const update_id = '58c9d33a1f3ffc0ee7c2c80d';
const response_id = '58c9d33a1f3ffc0ee7c2c80e';

// Constants
const update_days = ['monday', 'wednesday', 'friday'];
const task_statuses = ['in_progress', 'completed'];

mongoose.connection.on('connected', function () {
    logger.silly('Mongoose default connection open');
    dropDb()
    .then(startSeed)
    .catch(handleSeedError);
});

function startSeed() {
    logger.silly('starting seed...');

    async.auto({

        // Team + members
        team: createTeam,
        mitchell: createMitchellUser,
        kori: createKoriUser,
        allen: createAllenUser,
        mike: createMikeUser,

        // Projects
        mitchell_created_projects: mitchellCreatedProjects,
        kori_created_projects: koriCreatedProjects,
        allen_created_projects: allenCreatedProjects,
        mike_created_projects: mikeCreatedProjects,

        // Project invitations
        mitchellReceivedProjectInvitations,
        koriReceivedProjectInvitations,
        allenReceivedProjectInvitations,
        mikeReceivedProjectInvitations,

        // Tasks
        tasks_assigned_by_mitchell: tasksAssignedByMitchell,
        tasks_assigned_by_kori: tasksAssignedByKori,
        tasks_assigned_by_allen: tasksAssignedByAllen,
        tasks_assigned_by_mike: tasksAssignedByMike,

        // Task invitations
        task_invitations_sent_by_mitchell: taskInvitationsSentByMitchell,
        task_invitations_sent_by_kori: taskInvitationsSentByKori,
        task_invitations_sent_by_allen: taskInvitationsSentByAllen,
        task_invitations_sent_by_mike: taskInvitationsSentByMike,

        // Update requests
        update_requests_sent_by_mitchell: updateRequestsSentByMitchell,
        update_requests_sent_by_kori: updateRequestsSentByKori,
        update_requests_sent_by_allen: updateRequestsSentByAllen,
        update_requests_sent_by_mike: updateRequestsSentByMike,

        // Updates
        updates_sent_to_mitchell: updatesSentToMitchell,
        updates_sent_to_kori: updatesSentToKori,
        updates_sent_to_allen: updatesSentToAllen,
        updates_sent_to_mike: updatesSentToMike,

        // Standups
        standups

    }, (err, results) => {
        if (err) return handleSeedError(err);
        handleSeedSuccess();
    });
}

function dropDb() {
    logger.silly('dropping db');
    return mongoose.connection.db.dropDatabase();
}

// Team + Members

function createTeam(callback) {
    logger.silly('creating design first apps team');
    var design_first_apps_team = new Team({
        name: 'designfirstapps'
    });
    design_first_apps_team._id = team_id;

    design_first_apps_team.save()
        .then(team => {
            callback(null, team);
        })
        .catch(callback);
}

const createMitchellUser = ['team', function createMitchellUser(results, callback) {
    logger.silly('creating mitchell user');

    var user = new User({
        _id: new mongoose.mongo.ObjectId(dummy_user_mitchell_id),
        name: 'Mitchell',
        password: '1234',
        email: 'mitchell@designfirstapps.com',
        position: 'iOS dev',
        avatar_url: mitchell_avatar_url,
        team: results.team
    });

    user.save()
    .then(mitchell => {
        callback(null, mitchell);
    })
    .catch(callback);
}];

const createKoriUser = ['team', function(results, callback) {
    logger.silly('creating kori user');

    var user = new User({
        _id: new mongoose.mongo.ObjectId(dummy_user_kori_id),
        name: 'Kori',
        password: '1234',
        email: 'mitchell@founderfox.io',
        position: 'designer',
        avatar_url: kori_avatar_url,
        team: results.team
    });

    user.save()
    .then(kori => {
        callback(null, kori);
    })
    .catch(callback);
}];

const createAllenUser = ['team', function (results, callback) {
    logger.silly('creating allen user');

    var user = new User({
        _id: new mongoose.mongo.ObjectId(dummy_user_allen_id),
        name: 'Allen',
        password: '1234',
        email: 'allen@designfirstapps.com',
        position: 'iOS dev',
        avatar_url: allen_avatar_url,
        team: results.team
    });

    user.save()
    .then(allen => {
        callback(null, allen);
    })
    .catch(callback);
}];

const createMikeUser = ['team', function (results, callback) {
    logger.silly('creating mike user');

    var user = new User({
        _id: new mongoose.mongo.ObjectId(dummy_user_mike_id),
        name: 'Mike',
        password: '1234',
        email: 'mike@designfirstapps.com',
        position: 'web dev',
        avatar_url: mike_avatar_url,
        team: results.team
    });

    user.save()
    .then(mike => {
        callback(null, mike);
    })
    .catch(callback);
}];

// Projects

const mitchellCreatedProjects = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
    logger.silly('creating projects created by mitchell');

    var createProject = function(callback) {

        let project = new Project({
            creator: results.mitchell,
            members: [results.mitchell, results.kori, results.allen, results.mike],
            name: 'This is a test project title',
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        });
        
        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.create(projects).then(projects => { callback(null, projects) }).catch(callback);
    });
}];

const koriCreatedProjects = ['kori', 'mitchell', 'allen', 'mike', function (results, callback) {
     logger.silly('creating projects created by kori');

    var createProject = function(callback) {

        let project = new Project({
            creator: results.kori,
            members: [results.mitchell, results.kori, results.allen, results.mike],
            name: 'This is a test project title',
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        });
        
        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.create(projects).then(projects => { callback(null, projects) }).catch(callback);
    });
}];

const allenCreatedProjects = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
     logger.silly('creating projects created by allen');

    var createProject = function(callback) {

        let project = new Project({
            creator: results.allen,
            members: [results.mitchell, results.kori, results.allen, results.mike],
            name: 'This is a test project title',
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        });
        
        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.create(projects).then(projects => { callback(null, projects) }).catch(callback);
    });
}];

const mikeCreatedProjects = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
     logger.silly('creating projects created by mike');

    var createProject = function(callback) {

        let project = new Project({
            creator: results.mike,
            members: [results.mitchell, results.kori, results.allen, results.mike],
            name: 'This is a test project title',
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        });
        
        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.create(projects).then(projects => { callback(null, projects) }).catch(callback);
    });
}];

// Project Invitations

const mitchellReceivedProjectInvitations = ['mitchell', 'kori_created_projects', 'allen_created_projects', 'mike_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by mitchell');

    const projects = _.merge(results.kori_created_projects, results.allen_created_projects, results.mike_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation = new ProjectInvitation({
            sender: projects[n].creator,
            receiver: results.mitchell,
            project: projects[n]
        });
 
        project_invitation.save().then(project_invitation => { callback(null, project_invitation) }).catch(callback);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        callback(null, project_invitations);
    });
}];

const koriReceivedProjectInvitations = ['kori', 'mitchell_created_projects', 'allen_created_projects', 'mike_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by kori');

    const projects = _.merge(results.mitchell_created_projects, results.allen_created_projects, results.mike_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation = new ProjectInvitation({
            sender: projects[n].creator,
            receiver: results.kori,
            project: projects[n]
        });
 
        project_invitation.save().then(project_invitation => { callback(null, project_invitation) }).catch(callback);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        callback(null, project_invitations);
    });
}];

const allenReceivedProjectInvitations = ['allen', 'mitchell_created_projects', 'kori_created_projects', 'mike_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by allen');

    const projects = _.merge(results.mitchell_created_projects, results.kori_created_projects, results.mike_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation = new ProjectInvitation({
            sender: projects[n].creator,
            receiver: results.allen,
            project: projects[n]
        });
 
        project_invitation.save().then(project_invitation => { callback(null, project_invitation) }).catch(callback);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        callback(null, project_invitations);
    });
}];

const mikeReceivedProjectInvitations = ['mike', 'mitchell_created_projects', 'kori_created_projects', 'allen_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by mike');

    const projects = _.merge(results.mitchell_created_projects, results.kori_created_projects, results.allen_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation = new ProjectInvitation({
            sender: projects[n].creator,
            receiver: results.mike,
            project: projects[n]
        });
 
        project_invitation.save().then(project_invitation => { callback(null, project_invitation) }).catch(callback);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        callback(null, project_invitations);
    });
}];

// Tasks
const tasksAssignedByMitchell = ['mitchell', 'kori', 'allen', 'mike', 'mitchell_created_projects', function (results, callback) {
    logger.silly('creating tasks assigned by mitchell');

    const assignees = [results.kori, results.allen, results.mike];
    var createTask = function(n, callback) {

        let task = new Task({
            assigner: results.mitchell,
            assignee: assignees[n],
            project: results.mitchell_created_projects[n],
            title: 'this is a test task title',
            status: 'in_progress'
        });
        
        task.save().then(task => { callback(null, task) }).catch(callback);
    };

    async.times(results.mitchell_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        callback(null, tasks);
    });
}];

const tasksAssignedByKori = ['mitchell', 'kori', 'allen', 'mike', 'kori_created_projects', function (results, callback) {
    logger.silly('CREATED PROJECTS LENGTH: ' + results.kori_created_projects.length);

    const assignees = [results.mitchell, results.allen, results.mike];
    logger.silly('ASSIGNEES LENGTH: ' + assignees.length);
    
    var createTask = function(n, callback) {

        logger.silly('CREATE TASK');

        let task = new Task({
            assigner: results.kori,
            assignee: assignees[n],
            project: results.kori_created_projects[n],
            title: 'this is a test task title',
            status: 'in_progress'
        });

        task.save()
        .then(task => { 
        logger.silly('TASK SUCCESS');
        callback(null, task) 
        })
        .catch(err => {
            logger.silly('TASK FAIL: ' + err);
            logger.silly('TASK THAT FAILED: ' + task);
            callback(err); 
        });
    };

    logger.silly('async ' + results.kori_created_projects.length + ' times');
    async.times(results.kori_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            logger.silly('next');
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        callback(null, tasks);
    });
}];

// // Pretend this is some complicated async factory
// var createUser = function(id, callback) {
//     callback(null, {
//         id: 'user' + id
//     });
// };

// // generate 5 users
// async.times(5, function(n, next) {
//     createUser(n, function(err, user) {
//         next(err, user);
//     });
// }, function(err, users) {
//     // we should now have 5 users
// });

const tasksAssignedByAllen = ['mitchell', 'kori', 'allen', 'mike', 'allen_created_projects', function (results, callback) {
    logger.silly('creating tasks assigned by allen');

    const assignees = [results.mitchell, results.kori, results.mike];
    var createTask = function(n, callback) {

        let task = new Task({
            assigner: results.allen,
            assignee: assignees[n],
            project: results.allen_created_projects[n],
            title: 'this is a test task title',
            status: 'in_progress'
        });
        
        task.save().then(task => { callback(null, task) }).catch(callback);
    };

    async.times(results.allen_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        callback(null, tasks);
    });
}];

const tasksAssignedByMike = ['mitchell', 'kori', 'allen', 'mike', 'mike_created_projects', function (results, callback) {
    logger.silly('creating tasks assigned by mike');

    const assignees = [results.mitchell, results.kori, results.allen];
    var createTask = function(n, callback) {

        let task = new Task({
            assigner: results.mike,
            assignee: assignees[n],
            project: results.mike_created_projects[n],
            title: 'this is a test task title',
            status: 'in_progress'
        });
        
        task.save().then(task => { callback(null, task) }).catch(callback);
    };

    async.times(results.mike_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        callback(null, tasks);
    });
}];

// Task invitations
const taskInvitationsSentByMitchell = ['mitchell', 'tasks_assigned_by_mitchell', function (results, callback) {
    logger.silly('creating task invitations sent by mitchell');

    const createTaskInvitation = function(n, callback) {

        let task_invitation = new TaskInvitation({
            task: results.tasks_assigned_by_mitchell[n],
            sender: results.mitchell,
            receiver: results.tasks_assigned_by_mitchell[n].assignee
        });
        
        task_invitation.save().then(task_invitation => { callback(null, task_invitation) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        callback(null, task_invitations);
    });
}];

const taskInvitationsSentByKori = ['kori', 'tasks_assigned_by_kori', function (results, callback) {
    logger.silly('creating task invitations sent by kori');

    const createTaskInvitation = function(n, callback) {

        let task_invitation = new TaskInvitation({
            task: results.tasks_assigned_by_kori[n],
            sender: results.kori,
            receiver: results.tasks_assigned_by_kori[n].assignee
        });
        
        task_invitation.save().then(task_invitation => { callback(null, task_invitation) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_kori.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        callback(null, task_invitations);
    });
}];

const taskInvitationsSentByAllen = ['allen', 'tasks_assigned_by_allen', function (results, callback) {
    logger.silly('creating task invitations sent by allen');

    const createTaskInvitation = function(n, callback) {

        let task_invitation = new TaskInvitation({
            task: results.tasks_assigned_by_allen[n],
            sender: results.allen,
            receiver: results.tasks_assigned_by_allen[n].assignee
        });
        
        task_invitation.save().then(task_invitation => { callback(null, task_invitation) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_allen.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        callback(null, task_invitations);
    });
}];

const taskInvitationsSentByMike = ['mike', 'tasks_assigned_by_mike', function (results, callback) {
    logger.silly('creating task invitations sent by mike');

    const createTaskInvitation = function(n, callback) {

        let task_invitation = new TaskInvitation({
            task: results.tasks_assigned_by_mike[n],
            sender: results.mike,
            receiver: results.tasks_assigned_by_mike[n].assignee
        });
        
        task_invitation.save().then(task_invitation => { callback(null, task_invitation) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mike.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        callback(null, task_invitations);
    });
}];

// Update requests
const updateRequestsSentByMitchell = ['tasks_assigned_by_mitchell', function (results, callback) {
    logger.silly('creating update requests sent by mitchell');

    const createUpdateRequest = function(n, callback) {

        let update_request = new UpdateRequest({
            task: results.tasks_assigned_by_mitchell[n]
        });
        update_request.save().then(update_request => { callback(null, update_request) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        callback(null, update_requests);
    });
}];

const updateRequestsSentByKori = ['tasks_assigned_by_kori', function (results, callback) {
    logger.silly('creating update requests sent by kori');

    const createUpdateRequest = function(n, callback) {

        let update_request = new UpdateRequest({
            task: results.tasks_assigned_by_kori[n]
        });
        update_request.save().then(update_request => { callback(null, update_request) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        callback(null, update_requests);
    });
}];

const updateRequestsSentByAllen = ['tasks_assigned_by_allen', function (results, callback) {
    logger.silly('creating update requests sent by allen');

    const createUpdateRequest = function(n, callback) {

        let update_request = new UpdateRequest({
            task: results.tasks_assigned_by_allen[n]
        });
        update_request.save().then(update_request => { callback(null, update_request) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        callback(null, update_requests);
    });
}];

const updateRequestsSentByMike = ['tasks_assigned_by_mike', function (results, callback) {
    logger.silly('creating update requests sent by mike');

    const createUpdateRequest = function(n, callback) {

        let update_request = new UpdateRequest({
            task: results.tasks_assigned_by_mike[n]
        });
        update_request.save().then(update_request => { callback(null, update_request) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mike.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        callback(null, update_requests);
    });
}];

// Updates
const updatesSentToMitchell = ['tasks_assigned_by_mitchell', function (results, callback) {
    logger.silly('creating updates sent to mitchell');

    const createUpdate = function(n, callback) {
        
        let update = new Update({
            sender: results.tasks_assigned_by_mitchell[n].assignee,
            comment: 'this is a test update comment',
            task: results.tasks_assigned_by_mitchell[n]
        });
        update.save().then(update => { callback(null, update) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        callback(null, updates);
    });
}];

const updatesSentToKori = ['tasks_assigned_by_kori', function (results, callback) {
    logger.silly('creating updates sent to kori');

    const createUpdate = function(n, callback) {
        
        let update = new Update({
            sender: results.tasks_assigned_by_kori[n].assignee,
            comment: 'this is a test update comment',
            task: results.tasks_assigned_by_kori[n]
        });
        update.save().then(update => { callback(null, update) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_kori.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        callback(null, updates);
    });
}];

const updatesSentToAllen = ['tasks_assigned_by_allen', function (results, callback) {
    logger.silly('creating updates sent to allen');

    const createUpdate = function(n, callback) {
        
        let update = new Update({
            sender: results.tasks_assigned_by_allen[n].assignee,
            comment: 'this is a test update comment',
            task: results.tasks_assigned_by_allen[n]
        });
        update.save().then(update => { callback(null, update) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_allen.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        callback(null, updates);
    });
}];

const updatesSentToMike = ['tasks_assigned_by_mike', function (results, callback) {
    logger.silly('creating updates sent to mike');

    const createUpdate = function(n, callback) {
        
        let update = new Update({
            sender: results.tasks_assigned_by_mike[n].assignee,
            comment: 'this is a test update comment',
            task: results.tasks_assigned_by_mike[n]
        });
        update.save().then(update => { callback(null, update) }).catch(callback);
    };

    async.times(results.tasks_assigned_by_mike.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        callback(null, updates);
    });
}];

// Standups
const standups = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
    logger.silly('creating standups');

    const users = [results.mitchell, results.kori, results.allen, results.mike];
    const createStandup = function(n, callback) {
        
        const index = Math.trunc((n / 12) * 4);
        let standup = new Standup({
            author: users[index],
            text: 'this is a test standup'
        });
        standup.save().then(standup => { callback(null, standup) }).catch(callback);
    };

    async.times(users.length * 3, (n, next) => {
        createStandup(n, (err, standup) => {
            next(err, standup);
        });
    }, (err, standups) => {
        if (err) return callback(err);
        callback(null, standups);
    });
}];


function handleSeedSuccess() {
    logger.silly('successfully seeded db');
    process.exit();
}

function handleSeedError(err) {
    logger.error('seed error: ' + err);
    process.exit();
}