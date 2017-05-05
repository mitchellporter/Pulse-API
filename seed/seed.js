'use strict'

const util = require('util');

const async = require('async');
const _ = require('lodash');
const moment = require('moment');
const casual = require('casual');
const faker = require('faker');
const Promise = require('bluebird');
const config = require('../config/config');

const knex = require('knex')(require('../knexfile')['development']);
const knex_cleaner = require('knex-cleaner');
const Model = require('objection').Model;
Model.knex(knex);

const logger = require('../lib/logger');
const Team = require('../app/teams/team');
const User = require('../app/users/user');

// console.log('haha: ' + User.relationMappings.team.modelClass.name);

const Project = require('../app/projects/project');
const ProjectInvitation = require('../app/project_invitations/projectInvitation');
const Task = require('../app/tasks/task');
const TaskInvitation = require('../app/task_invitations/taskInvitation');
const Subtask = require('../app/subtasks/subtask');
const Update = require('../app/updates/update');
const UpdateRequest = require('../app/update_requests/updateRequest');
const Standup = require('../app/standups/standup');

// Assets
const cdn_url = 'https://d33833kh9ui3rd.cloudfront.net/';
const asset_file_format = '.png';
const avatar_asset_names = ['AllisonReynolds', 'DinaAlexander', 'DylanMcKay', 'EddieGelfen', 'EllenJosephineHickle', 'Iggy', 'Lisa', 'Oblina', 'PeteWrigley',
    'RichardWang', 'Rufio', 'SamEmerson', 'ScottHoward', 'SimonHolmes', 'TinaCarlyle', 'WillSmith'];

const positions = ['iOS Developer', 'Android Developer', 'Mobile Designer', 'Web Designer', 'Devops', 'Database Engineer', 'Customer Service Rep', 'Sales / Marketing', 'CEO'];
const task_titles = ['Design the new navigation icons for the mobile app', 'We need a basic marketing website for the new app can', 'We need to review resumes for new Android developers'];
const item_titles = ['Needs, Sign up button, place to input email address, or phone number.', 'Make sure to hi-light the press we recieved (Time, Inc. NYT.)', 'Show screen shots of the app in action.', 'Nice big hero image at the top.'];


const dummy_user_mitchell_id = 1;
const mitchell_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/mitchell.png';
const mitchell_standup_id = 6;

// Permanent dummy users
const dummy_user_kori_id = 2;
const kori_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/kori.png';
const kori_standup_id = 7;

const dummy_user_allen_id = 3;
const allen_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/allen.png';
const allen_standup_id = 8;

const dummy_user_arch_id = 4;
const arch_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/arch.png'
const arch_standup_id = 9;

const dummy_user_mike_id = 5;
const mike_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/mike.png';
const mike_standup_id = 10;

const standup_text = 'Today I did several things to the iOS app:\n\n1. I replaced the old launch screen image with the new image\n2. I added and setup the Crashlytics SDK\n3. I added the new app icons\n';

// 1 day in ms, 2 days, ...
const dummy_task_due_dates = [new Date(Date.now() + 86400000).toISOString(), new Date(Date.now() + 172800000).toISOString(), new Date(Date.now() + 259200000).toISOString(), new Date(Date.now() + 345600000).toISOString()];

const pending_task_id = 11;
const in_progress_task_id = 12;
const task_invitation_id = 13;
const team_id = 14;
const item_id = 15;
const update_id = 16;
const response_id = 17;

// Constants
const update_days = ['monday', 'wednesday', 'friday'];
const task_statuses = ['in_progress', 'completed'];

knex.raw('select 1+1 as result').then(function () {
  // there is a valid connection in the pool
    logger.silly('knex successful connection to pg');

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
        createusers: createUsers,

        // // Projects
        mitchell_created_projects: mitchellCreatedProjects,
        kori_created_projects: koriCreatedProjects,
        allen_created_projects: allenCreatedProjects,
        mike_created_projects: mikeCreatedProjects,

        // // Project invitations
        mitchellReceivedProjectInvitations,
        koriReceivedProjectInvitations,
        allenReceivedProjectInvitations,
        mikeReceivedProjectInvitations,

        // // Tasks
        tasks_assigned_by_mitchell: tasksAssignedByMitchell,
        tasks_assigned_by_kori: tasksAssignedByKori,
        tasks_assigned_by_allen: tasksAssignedByAllen,
        tasks_assigned_by_mike: tasksAssignedByMike,

        // // Task invitations
        task_invitations_sent_by_mitchell: taskInvitationsSentByMitchell,
        task_invitations_sent_by_kori: taskInvitationsSentByKori,
        task_invitations_sent_by_allen: taskInvitationsSentByAllen,
        task_invitations_sent_by_mike: taskInvitationsSentByMike,

        // // Update requests
        update_requests_sent_by_mitchell: updateRequestsSentByMitchell,
        update_requests_sent_by_kori: updateRequestsSentByKori,
        update_requests_sent_by_allen: updateRequestsSentByAllen,
        update_requests_sent_by_mike: updateRequestsSentByMike,

        // // Updates
        updates_sent_to_mitchell: updatesSentToMitchell,
        updates_sent_to_kori: updatesSentToKori,
        updates_sent_to_allen: updatesSentToAllen,
        updates_sent_to_mike: updatesSentToMike,

        // // Standups
        standups

    }, (err, results) => {
        if (err) return handleSeedError(err);
        handleSeedSuccess();
    });
}

function dropDb() {
    logger.silly('dropping db');
    return new Promise((resolve, reject) => {
        knex_cleaner.clean(knex).then(function () {
            resolve();
        });
    });
}

// Team + Members

function createTeam(callback) {
    logger.silly('creating design first apps team');

    Team
    .query()
    .insert({ id: team_id, name: 'designfirstapps' })
    .then(team => {
        callback(null, team);
    })
    .catch(handleSeedError);
}

const createMitchellUser = ['team', function createMitchellUser(results, callback) {
    logger.silly('creating mitchell user');

    const user = {
        id: dummy_user_mitchell_id,
        name: 'Mitchell Porter',
        password: '1234',
        email: 'mitchell@designfirstapps.com',
        position: 'iOS dev',
        avatar_url: mitchell_avatar_url,
        team: results.team.id
    };

    const mitchell = User.fromJson(user);

    User
    .query()
    .insert(mitchell)
    .returning('*')
    .then(mitchell => {
        callback(null, mitchell);
    })
    .catch(handleSeedError);

}];

const createKoriUser = ['team', function(results, callback) {
    logger.silly('creating kori user');

    const user = {
        id: dummy_user_kori_id,
        name: 'Kori Handy',
        password: '1234',
        email: 'kori@designfirstapps.com',
        position: 'CEO',
        avatar_url: kori_avatar_url,
        team: results.team.id
    };

    const kori = User.fromJson(user);

    User
    .query()
    .insert(kori)
    .returning('*')
    .then(kori => {
        callback(null, kori);
    })
    .catch(handleSeedError);
}];

const createAllenUser = ['team', function (results, callback) {
    logger.silly('creating allen user');

    const user = {
        id: dummy_user_allen_id,
        name: 'Allen Hurst',
        password: '1234',
        email: 'allen@designfirstapps.com',
        position: 'iOS Dev',
        avatar_url: allen_avatar_url,
        team: results.team.id
    };

    const allen = User.fromJson(user);

    User
    .query()
    .insert(allen)
    .returning('*')
    .then(allen => {
        callback(null, allen);
    })
    .catch(handleSeedError);
}];

const createMikeUser = ['team', function (results, callback) {
    logger.silly('creating mike user');

    const user = {
        id: dummy_user_mike_id,
        name: 'Mike Chen',
        password: '1234',
        email: 'mike@designfirstapps.com',
        position: 'Web Dev',
        avatar_url: mike_avatar_url,
        team: results.team.id
    };

    const mike = User.fromJson(user);

    User
    .query()
    .insert(mike)
    .returning('*')
    .then(mike => {
        callback(null, mike);
    })
    .catch(handleSeedError);
}];

const createUsers = ['team', function (results, callback) {
    logger.silly('creating other users');

    const users = require('./users')();

    async.forEach(users, (value, callback) => {
        const user = User.fromJson(value);
        User.query().insert(user).then(user => { callback(null) }).catch(callback);
    }, err => {
        if (err) return handleSeedError(err);
        callback(null);
    });
}];

// Projects

const mitchellCreatedProjects = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
    logger.silly('creating projects created by mitchell');

    var createProject = function(callback) {

        let project_json = {
            creator: results.mitchell.id,
            name: 'This is a test project title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        };

        const project = Project.fromJson(project_json);
        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.query().insert(projects).returning('*').then(projects => { callback(null, projects) }).catch(logger.error);
    });
}];

const koriCreatedProjects = ['kori', 'mitchell', 'allen', 'mike', function (results, callback) {
     logger.silly('creating projects created by kori');

    var createProject = function(callback) {

        let project = {
            creator: results.kori.id,
            name: 'This is a test project title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        };

        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.query().insert(projects).returning('*').then(projects => { callback(null, projects) }).catch(logger.error);
    });
}];

const allenCreatedProjects = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
     logger.silly('creating projects created by allen');

    var createProject = function(callback) {

        let project = {
            creator: results.allen.id,
            name: 'This is a test project title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        };

        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.query().insert(projects).returning('*').then(projects => { callback(null, projects) }).catch(logger.error);
    });
}];

const mikeCreatedProjects = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
     logger.silly('creating projects created by mike');

    var createProject = function(callback) {

        let project = {
            creator: results.mike.id,
            name: 'This is a test project title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            completion_percentage: 0, // TODO: Add random completion percentage
            standups_count: 0,
            tasks_in_progress_count: 0,
            tasks_completed_count: 0
        };

        callback(null, project);
    };

    async.times(3, (n, next) => {
        createProject((err, project) => {
            next(err, project);
        });
    }, (err, projects) => {
        if (err) return callback(err);
        Project.query().insert(projects).returning('*').then(projects => { callback(null, projects) }).catch(logger.error);
    });
}];

// Project Invitations

const mitchellReceivedProjectInvitations = ['mitchell', 'kori_created_projects', 'allen_created_projects', 'mike_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by mitchell');

    const projects = _.merge(results.kori_created_projects, results.allen_created_projects, results.mike_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation_json = {
            project: projects[n].id,
            sender: projects[n].creator_id,
            receiver: results.mitchell.id
        };

        const project_invitation = ProjectInvitation.fromJson(project_invitation_json);
        callback(null, project_invitation);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        ProjectInvitation.query().insert(project_invitations).then(project_invitations => { callback(null, project_invitations) }).catch(logger.error);
    });
}];

const koriReceivedProjectInvitations = ['kori', 'mitchell_created_projects', 'allen_created_projects', 'mike_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by kori');

    const projects = _.merge(results.mitchell_created_projects, results.allen_created_projects, results.mike_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation_json = {
            project: projects[n].id,
            sender: projects[n].creator_id,
            receiver: results.kori.id
        };

        const project_invitation = ProjectInvitation.fromJson(project_invitation_json);
        callback(null, project_invitation);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        ProjectInvitation.query().insert(project_invitations).then(project_invitations => { callback(null, project_invitations) }).catch(logger.error);
    });
}];

const allenReceivedProjectInvitations = ['allen', 'mitchell_created_projects', 'kori_created_projects', 'mike_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by allen');

    const projects = _.merge(results.mitchell_created_projects, results.kori_created_projects, results.mike_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation_json = {
            project: projects[n].id,
            sender: projects[n].creator_id,
            receiver: results.allen.id
        };

        const project_invitation = ProjectInvitation.fromJson(project_invitation_json);
        callback(null, project_invitation);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        ProjectInvitation.query().insert(project_invitations).then(project_invitations => { callback(null, project_invitations) }).catch(logger.error);
    });
}];

const mikeReceivedProjectInvitations = ['mike', 'mitchell_created_projects', 'kori_created_projects', 'allen_created_projects', function (results, callback) {
    logger.silly('creating project invitations received by mike');

    const projects = _.merge(results.mitchell_created_projects, results.kori_created_projects, results.allen_created_projects);
    var createProjectInvitation = function(n, callback) {

        let project_invitation_json = {
            project: projects[n].id,
            sender: projects[n].creator_id,
            receiver: results.mike.id
        };

        const project_invitation = ProjectInvitation.fromJson(project_invitation_json);
        callback(null, project_invitation);
    };

    async.times(projects.length, (n, next) => {
        createProjectInvitation(n, (err, project) => {
            next(err, project);
        });
    }, (err, project_invitations) => {
        if (err) return callback(err);
        ProjectInvitation.query().insert(project_invitations).then(project_invitations => { callback(null, project_invitations) }).catch(logger.error);
    });
}];

// Tasks
const tasksAssignedByMitchell = ['mitchell', 'kori', 'allen', 'mike', 'mitchell_created_projects', function (results, callback) {
    logger.silly('creating tasks assigned by mitchell');

    const assignees = [results.kori, results.allen, results.mike];
    var createTask = function(n, callback) {

        let task_json = {
            assigner: results.mitchell.id,
            assignee: assignees[n].id,
            project: results.mitchell_created_projects[n].id,
            title: 'this is a test task title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            status: 'in_progress',
            completion_percentage: Number(Math.random() * (100 - 27) + 27).toFixed(0),
            attachment_count: Number(Math.random() * (10 - 2) + 2).toFixed(0),
            chat_count: Number(Math.random() * (10 - 2) + 2).toFixed(0)
        };

        const task = Task.fromJson(task_json);
        callback(null, task);
    };

    async.times(results.mitchell_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        Task.query().insert(tasks).then(tasks => { callback(null, tasks) }).catch(logger.error);
    });
}];

const tasksAssignedByKori = ['mitchell', 'kori', 'allen', 'mike', 'kori_created_projects', function (results, callback) {

    const assignees = [results.mitchell, results.allen, results.mike];
    var createTask = function(n, callback) {

        let task_json = {
            assigner: results.kori.id,
            assignee: assignees[n].id,
            project: results.kori_created_projects[n].id,
            title: 'this is a test task title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            status: 'in_progress',
            completion_percentage: Number(Math.random() * (100 - 27) + 27).toFixed(0),
            attachment_count: Number(Math.random() * (10 - 2) + 2).toFixed(0),
            chat_count: Number(Math.random() * (10 - 2) + 2).toFixed(0)
        };

        const task = Task.fromJson(task_json);
        callback(null, task);
    };

    async.times(results.kori_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        Task.query().insert(tasks).then(tasks => { callback(null, tasks) }).catch(logger.error);
    });
}];

const tasksAssignedByAllen = ['mitchell', 'kori', 'allen', 'mike', 'allen_created_projects', function (results, callback) {
    logger.silly('creating tasks assigned by allen');

    const assignees = [results.mitchell, results.kori, results.mike];
    var createTask = function(n, callback) {

        let task_json = {
            assigner: results.allen.id,
            assignee: assignees[n].id,
            project: results.allen_created_projects[n].id,
            title: 'this is a test task title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            status: 'in_progress',
            completion_percentage: Number(Math.random() * (100 - 27) + 27).toFixed(0),
            attachment_count: Number(Math.random() * (10 - 2) + 2).toFixed(0),
            chat_count: Number(Math.random() * (10 - 2) + 2).toFixed(0)
        };

        const task = Task.fromJson(task_json);
        callback(null, task);
    };

    async.times(results.allen_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        Task.query().insert(tasks).then(tasks => { callback(null, tasks) }).catch(logger.error);
    });
}];

const tasksAssignedByMike = ['mitchell', 'kori', 'allen', 'mike', 'mike_created_projects', function (results, callback) {
    logger.silly('creating tasks assigned by mike');

    const assignees = [results.mitchell, results.kori, results.allen];
    var createTask = function(n, callback) {

        let task_json = {
            assigner: results.mike.id,
            assignee: assignees[n].id,
            project: results.mike_created_projects[n].id,
            title: 'this is a test task title',
            due_date: dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)],
            status: 'in_progress',
            completion_percentage: Number(Math.random() * (100 - 27) + 27).toFixed(0),
            attachment_count: Number(Math.random() * (10 - 2) + 2).toFixed(0),
            chat_count: Number(Math.random() * (10 - 2) + 2).toFixed(0)
        };

        const task = Task.fromJson(task_json);
        callback(null, task);
    };

    async.times(results.mike_created_projects.length, (n, next) => {
        createTask(n, (err, task) => {
            next(err, task);
        });
    }, (err, tasks) => {
        if (err) return callback(err);
        Task.query().insert(tasks).then(tasks => { callback(null, tasks) }).catch(logger.error);
    });
}];

// Task invitations
const taskInvitationsSentByMitchell = ['mitchell', 'tasks_assigned_by_mitchell', function (results, callback) {
    logger.silly('creating task invitations sent by mitchell');

    const createTaskInvitation = function(n, callback) {

        let task_invitation_json = {
            task: results.tasks_assigned_by_mitchell[n].id,
            sender: results.mitchell.id,
            receiver: results.tasks_assigned_by_mitchell[n].assignee_id
        };

        const task_invitation = TaskInvitation.fromJson(task_invitation_json);
        callback(null, task_invitation);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        TaskInvitation.query().insert(task_invitations).then(task_invitations => { callback(null, task_invitations) }).catch(logger.error);
    });
}];

const taskInvitationsSentByKori = ['kori', 'tasks_assigned_by_kori', function (results, callback) {
    logger.silly('creating task invitations sent by kori');

    const createTaskInvitation = function(n, callback) {

        let task_invitation_json = {
            task: results.tasks_assigned_by_kori[n].id,
            sender: results.kori.id,
            receiver: results.tasks_assigned_by_kori[n].assignee_id
        };

        const task_invitation = TaskInvitation.fromJson(task_invitation_json);
        callback(null, task_invitation);
    };

    async.times(results.tasks_assigned_by_kori.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        TaskInvitation.query().insert(task_invitations).then(task_invitations => { callback(null, task_invitations) }).catch(logger.error);
    });
}];

const taskInvitationsSentByAllen = ['allen', 'tasks_assigned_by_allen', function (results, callback) {
    logger.silly('creating task invitations sent by allen');

    const createTaskInvitation = function(n, callback) {

        let task_invitation_json = {
            task: results.tasks_assigned_by_allen[n].id,
            sender: results.allen.id,
            receiver: results.tasks_assigned_by_allen[n].assignee_id
        };

        const task_invitation = TaskInvitation.fromJson(task_invitation_json);
        callback(null, task_invitation);
    };

    async.times(results.tasks_assigned_by_allen.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        TaskInvitation.query().insert(task_invitations).then(task_invitations => { callback(null, task_invitations) }).catch(logger.error);
    });
}];

const taskInvitationsSentByMike = ['mike', 'tasks_assigned_by_mike', function (results, callback) {
    logger.silly('creating task invitations sent by mike');

    const createTaskInvitation = function(n, callback) {

        let task_invitation_json = {
            task: results.tasks_assigned_by_mike[n].id,
            sender: results.mike.id,
            receiver: results.tasks_assigned_by_mike[n].assignee_id
        };

        const task_invitation = TaskInvitation.fromJson(task_invitation_json);
        callback(null, task_invitation);
    };

    async.times(results.tasks_assigned_by_mike.length, (n, next) => {
        createTaskInvitation(n, (err, task_invitation) => {
            next(err, task_invitation);
        });
    }, (err, task_invitations) => {
        if (err) return callback(err);
        TaskInvitation.query().insert(task_invitations).then(task_invitations => { callback(null, task_invitations) }).catch(logger.error);
    });
}];

// Update requests
const updateRequestsSentByMitchell = ['tasks_assigned_by_mitchell', function (results, callback) {
    logger.silly('creating update requests sent by mitchell');

    const createUpdateRequest = function(n, callback) {

        let update_request_json = {
            sender: results.tasks_assigned_by_mitchell[n].assigner_id,
            receiver: results.tasks_assigned_by_mitchell[n].assignee_id,
            task: results.tasks_assigned_by_mitchell[n].id
        };

        const update_request = UpdateRequest.fromJson(update_request_json);
        callback(null, update_request);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        UpdateRequest.query().insert(update_requests).then(update_requests => { callback(null, update_requests) }).catch(logger.error);
    });
}];

const updateRequestsSentByKori = ['tasks_assigned_by_kori', function (results, callback) {
    logger.silly('creating update requests sent by kori');

   const createUpdateRequest = function(n, callback) {

        let update_request_json = {
            sender: results.tasks_assigned_by_kori[n].assigner_id,
            receiver: results.tasks_assigned_by_kori[n].assignee_id,
            task: results.tasks_assigned_by_kori[n].id
        };

        const update_request = UpdateRequest.fromJson(update_request_json);
        callback(null, update_request);
    };

    async.times(results.tasks_assigned_by_kori.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        UpdateRequest.query().insert(update_requests).then(update_requests => { callback(null, update_requests) }).catch(logger.error);
    });
}];

const updateRequestsSentByAllen = ['tasks_assigned_by_allen', function (results, callback) {
    logger.silly('creating update requests sent by allen');

    const createUpdateRequest = function(n, callback) {

        let update_request_json = {
            sender: results.tasks_assigned_by_allen[n].assigner_id,
            receiver: results.tasks_assigned_by_allen[n].assignee_id,
            task: results.tasks_assigned_by_allen[n].id
        };

        const update_request = UpdateRequest.fromJson(update_request_json);
        callback(null, update_request);
    };

    async.times(results.tasks_assigned_by_allen.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        UpdateRequest.query().insert(update_requests).then(update_requests => { callback(null, update_requests) }).catch(logger.error);
    });
}];

const updateRequestsSentByMike = ['tasks_assigned_by_mike', function (results, callback) {
    logger.silly('creating update requests sent by mike');

    const createUpdateRequest = function(n, callback) {

        let update_request_json = {
            sender: results.tasks_assigned_by_mike[n].assigner_id,
            receiver: results.tasks_assigned_by_mike[n].assignee_id,
            task: results.tasks_assigned_by_mike[n].id
        };

        const update_request = UpdateRequest.fromJson(update_request_json);
        callback(null, update_request);
    };

    async.times(results.tasks_assigned_by_mike.length, (n, next) => {
        createUpdateRequest(n, (err, update_request) => {
            next(err, update_request);
        });
    }, (err, update_requests) => {
        if (err) return callback(err);
        UpdateRequest.query().insert(update_requests).then(update_requests => { callback(null, update_requests) }).catch(logger.error);
    });
}];

// Updates
const updatesSentToMitchell = ['tasks_assigned_by_mitchell', function (results, callback) {
    logger.silly('creating updates sent to mitchell');

    const createUpdate = function(n, callback) {

        let json = {
            task: results.tasks_assigned_by_mitchell[n].id,
            sender: results.tasks_assigned_by_mitchell[n].assignee_id,
            receiver: results.tasks_assigned_by_mitchell[n].assigner_id,
            comment: 'this is a test update comment',
        };

        const update = Update.fromJson(json);
        callback(null, update);
    };

    async.times(results.tasks_assigned_by_mitchell.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        Update.query().insert(updates).then(updates => { callback(null, updates) }).catch(logger.error);
    });
}];

const updatesSentToKori = ['tasks_assigned_by_kori', function (results, callback) {
    logger.silly('creating updates sent to kori');

    const createUpdate = function(n, callback) {

        let json = {
            task: results.tasks_assigned_by_kori[n].id,
            sender: results.tasks_assigned_by_kori[n].assignee_id,
            receiver: results.tasks_assigned_by_kori[n].assigner_id,
            comment: 'this is a test update comment',
        };

        const update = Update.fromJson(json);
        callback(null, update);
    };

    async.times(results.tasks_assigned_by_kori.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        Update.query().insert(updates).then(updates => { callback(null, updates) }).catch(logger.error);
    });
}];

const updatesSentToAllen = ['tasks_assigned_by_allen', function (results, callback) {
    logger.silly('creating updates sent to allen');

    const createUpdate = function(n, callback) {

        let json = {
            task: results.tasks_assigned_by_allen[n].id,
            sender: results.tasks_assigned_by_allen[n].assignee_id,
            receiver: results.tasks_assigned_by_allen[n].assigner_id,
            comment: 'this is a test update comment',
        };

        const update = Update.fromJson(json);
        callback(null, update);
    };

    async.times(results.tasks_assigned_by_allen.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        Update.query().insert(updates).then(updates => { callback(null, updates) }).catch(logger.error);
    });
}];

const updatesSentToMike = ['tasks_assigned_by_mike', function (results, callback) {
    logger.silly('creating updates sent to mike');

    const createUpdate = function(n, callback) {

        let json = {
            task: results.tasks_assigned_by_mike[n].id,
            sender: results.tasks_assigned_by_mike[n].assignee_id,
            receiver: results.tasks_assigned_by_mike[n].assigner_id,
            comment: 'this is a test update comment',
        };

        const update = Update.fromJson(json);
        callback(null, update);
    };

    async.times(results.tasks_assigned_by_mike.length, (n, next) => {
        createUpdate(n, (err, update) => {
            next(err, update);
        });
    }, (err, updates) => {
        if (err) return callback(err);
        Update.query().insert(updates).then(updates => { callback(null, updates) }).catch(logger.error);
    });
}];

// Standups
const standups = ['mitchell', 'kori', 'allen', 'mike', function (results, callback) {
    logger.silly('creating standups');

    const users = [results.mitchell, results.kori, results.allen, results.mike];
    const createStandup = function(n, callback) {

        const index = Math.trunc((n / 12) * 4);
        let json = {
            author: users[index].id,
            text: 'I am going to be designing the website for ellroi. We have a new Web Developer starting on Wednesday and it needs to be ready for him to start.'
        };

        const standup = Standup.fromJson(json);
        callback(null, standup);
    };

    async.times(users.length * 3, (n, next) => {
        createStandup(n, (err, standup) => {
            next(err, standup);
        });
    }, (err, standups) => {
        if (err) return callback(err);
        Standup.query().insert(standups).then(standups => { callback(null, standups) }).catch(logger.error);
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
