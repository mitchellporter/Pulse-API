'use strict'

var config = require('../../config/config');
var logger = require('../../lib/logger');
var Team = require('../teams/teamModel');
var User = require('../users/userModel');
var Task = require('../tasks/taskModel');
var TaskInvitation = require('../tasks/taskInvitationModel');
var Item = require('../items/itemModel');
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

var dummy_user_allen_id = '5881130a387e980f48c743f7';
var allen_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/allen.png';


var dummy_user_arch_id = '58c70df6105bd171feeb2cbc';
var arch_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/arch.png'



// 1 day in ms, 2 days, ... 
var dummy_task_due_dates = [Date.now() + 86400000, Date.now() + 172800000, Date.now() + 259200000, Date.now() + 345600000];

var task_id = '586ebcae9188e7b6bfdd85c4';
var task_invitation_id = '58bf269e9b5a8ff83f9a94e2';
var team_id = '58b080b2356e913f3a3af182';
var item_id = '58b09c7c247aa67459185307';
var update_id = '58c9d33a1f3ffc0ee7c2c80d';

// Constants
var update_days = ['monday', 'wednesday', 'friday'];

mongoose.connection.on('connected', function () {
    logger.silly('Mongoose default connection open');
    startSeed();
});

function startSeed() {
    var mitchell;
    var kori;
    var allen;
    var arch;
    var users = [];

    var design_first_apps_team;
    logger.silly('starting arch seed process...');
    dropDb()
        .then(createTeam)
        .then(function (team) {
            design_first_apps_team = team;
            return createMitchell();
        })
        .then(function (mitchell_user) {
            mitchell = mitchell_user;
            users.push(mitchell);
            return createKori();
        })
        .then(function(kori_user) {
            kori = kori_user;
            users.push(kori);
            return createAllen();
        })
        .then(function(allen_user) {
            allen = allen_user;
            users.push(allen);
            return createArch();
        })
        .then(function(arch_user) {
            arch = arch_user;
            users.push(arch);
            return createTasks();
        })
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

    function createMitchell() {
        logger.silly('creating mitchell user');

        var user = new User({
            _id: new mongoose.mongo.ObjectId(dummy_user_mitchell_id),
            name: 'Mitchell',
            password: '1234',
            email_address: 'mitchell@designfirstapps.com',
            position: 'iOS dev',
            avatar_url: mitchell_avatar_url,
            team: design_first_apps_team
        });
        return user.save();
    }

    function createKori() {
        logger.silly('creating kori user');

        var user = new User({
            _id: new mongoose.mongo.ObjectId(dummy_user_kori_id),
            name: 'Kori',
            password: '1234',
            email_address: 'kori@designfirstapps.com',
            position: 'designer',
            avatar_url: kori_avatar_url,
            team: design_first_apps_team
        });
        return user.save();
    }

    function createAllen() {
        logger.silly('creating allen user');

        var user = new User({
            _id: new mongoose.mongo.ObjectId(dummy_user_allen_id),
            name: 'Allen',
            password: '1234',
            email_address: 'arch@designfirstapps.com',
            position: 'iOS dev',
            avatar_url: allen_avatar_url,
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

    function createTasks() {
        logger.silly('creating tasks ' + users.length);
        var tasks = [];
        return new Promise(function (resolve, reject) {
            async.forEachOf(users, function (value, key, callback) {
                var assigner = value;

                var assignees = Array.from(users);
                var filtered_assignees = assignees.filter(function(assignee) {
                    return assignee != assigner
                }); //  Filter out the assigner
                
                var task = new Task({
                    assigner: assigner,
                    assignees: filtered_assignees,
                    title: 'This tasks assigner is ' + assigner.name,
                    details: 'description goes here',
                    due_date: randomDueDate(), // optional,
                    status: 'in_progress'
                });
                tasks.push(task);
                callback();
            }, function (err) {
                if (err) return reject(err);
                resolve(Task.create(tasks));
            });
        });
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