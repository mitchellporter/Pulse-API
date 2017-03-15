'use strict'

var config = require('../../config/config');
var logger = require('../../lib/logger');
var Team = require('../teams/teamModel');
var User = require('../users/userModel');
var Task = require('../tasks/taskModel');
var TaskInvitation = require('../tasks/taskInvitationModel');
var Item = require('../items/itemModel');
var UpdateRequest = require('../update_requests/updateRequestModel');
var Update = require('../updates/updateModel');
var async = require('async');
var casual = require('casual');
var faker = require('faker');
var Promise = require('bluebird');
var mongoose = require('mongoose').connect(config.mongo_url);
mongoose.Promise = Promise;

// Assets
var cdn_url = 'https://d33833kh9ui3rd.cloudfront.net/';
var asset_file_format = '.png';
var avatar_asset_names = ['AllisonReynolds', 'DinaAlexander', 'DylanMcKay', 'EddieGelfen', 'EllenJosephineHickle', 'Iggy', 'Lisa', 'Oblina', 'PeteWrigley',
    'RichardWang', 'Rufio', 'SamEmerson', 'ScottHoward', 'SimonHolmes', 'TinaCarlyle', 'WillSmith'];

var positions = ['iOS Developer', 'Android Developer', 'Mobile Designer', 'Web Designer', 'Devops', 'Database Engineer', 'Customer Service Rep', 'Sales / Marketing', 'CEO'];
var task_titles = ['Design the new navigation icons for the mobile app', 'We need a basic marketing website for the new app can', 'We need to review resumes for new Android developers'];
var item_titles = ['Needs, Sign up button, place to input email address, or phone number.', 'Make sure to hi-light the press we recieved (Time, Inc. NYT.)', 'Show screen shots of the app in action.', 'Nice big hero image at the top.'];

// Permanent dummy users
var dummy_user_kori_id = '585c2130f31b2fbff4efbf68';
var kori_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/kori.png';
var dummy_user_mitchell_id = '586ecdc0213f22d94db5ef7f';
var mitchell_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/mitchell.png';

var dummy_user_arch_id = '58c70df6105bd171feeb2cbc';
var arch_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/arch.png'


// 1 day in ms, 2 days, ... 
var dummy_task_due_dates = [Date.now() + 86400000, Date.now() + 172800000, Date.now() + 259200000, Date.now() + 345600000];

var task_id = '586ebcae9188e7b6bfdd85c4';
var task_invitation_id = '58bf269e9b5a8ff83f9a94e2';
var team_id = '58b080b2356e913f3a3af182';
var item_id = '58b09c7c247aa67459185307';

// Constants
var update_days = ['monday', 'wednesday', 'friday'];

mongoose.connection.on('connected', function () {
    logger.silly('Mongoose default connection open');
    startSeed();
});

function startSeed() {
    var boss_man;
    var arch;

    var design_first_apps_team;
    logger.silly('starting arch seed process...');
    dropDb()
        .then(createTeam)
        .then(function (team) {
            design_first_apps_team = team;
            return createBossMan();
        })
        .then(function (boss_man_user) {
            boss_man = boss_man_user;
            return createArch();
        })
        .then(function(arch_user) {
            arch = arch_user;
            return createTask();
        })
        .then(createTaskItems)
        .then(createTaskInvitation)
        .then(handleSeedSuccess)
        .catch(handleSeedError)
       

    function dropDb() {
        logger.silly('dropping db');
        return mongoose.connection.db.dropDatabase();
    }

    function createTeam() {
        logger.silly('creating design first apps team');
        var team = new Team({
            domain: 'designfirstapps.com'
        });
        team._id = team_id;
        return team.save();
    }

    function createBossMan() {
        logger.silly('creating boss man user');
        var user = new User({
            _id: new mongoose.mongo.ObjectId(dummy_user_kori_id),
            name: 'John Brown',
            password: '1234',
            email_address: 'jbrown@designfirstapps.com',
            position: 'CEO',
            avatar_url: kori_avatar_url,
            team: design_first_apps_team
        });
        return user.save();
    }

    function createArch() {
        logger.silly('creating arch user');

        var user = new User({
            _id: new mongoose.mongo.ObjectId(dummy_user_arch_id),
            name: 'Arch',
            password: '1234',
            email_address: 'arch@designfirstapps.com',
            position: 'web dev',
            avatar_url: arch_avatar_url,
            team: design_first_apps_team
        });
        return user.save();
    }

    function createTask() {
        var task = new Task({
            _id: task_id,
            assigner: boss_man,
            assignees: arch,
            title: 'Design the new navigation icons for the mobile app',
            details: 'description goes here',
            due_date: randomDueDate(), // optional
        });
        return task.save();
    }

    function createTaskItems(task) {
        for (var x = 0; x < 5; x++) {
            var item = new Item({
                text: 'This is an individual item on the task.',
            });
            if (task.items.length == 0) item._id = item_id;
            logger.silly('item: ' + item);
            task.items.push(item);
        }
        task.isNew = false;
        return task.save();
    }

    function createTaskInvitation(task) {
            var task_invitation = new TaskInvitation({
                _id: task_invitation_id,
                sender: boss_man,
                receiver: arch,
                task: task,
            });
        return task_invitation.save();    
    }

    function randomDueDate() {
        return dummy_task_due_dates[Math.floor(Math.random() * dummy_task_due_dates.length)];
    }

    function randomAvatarURL() {
        return cdn_url + avatar_asset_names[Math.floor(Math.random() * avatar_asset_names.length)] + asset_file_format;
    }

    function randomPosition() {
        return positions[Math.floor(Math.random() * positions.length)];
    }

    function randomCompletionPercentage() {
        return Number(Math.random() * (100 - 27) + 27).toFixed(0);
    }

    function randomTasksInProgressCount() {
        return Number(Math.random() * (37 - 7) + 7).toFixed(1);
    }

    function handleSeedSuccess() {
        logger.silly('successfully seeded db');
        process.exit();
    }

    function handleSeedError(err) {
        logger.error('seed error: ' + err);
        process.exit();
    }
}