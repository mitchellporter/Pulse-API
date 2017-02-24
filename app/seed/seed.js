'use strict'

var config = require('../../config/config');
var logger = require('../../lib/logger');
var Team = require('../teams/teamModel');
var User = require('../users/userModel');
var Task = require('../tasks/taskModel');
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
var task_titles = [''];

// Permanent dummy users
var dummy_user_kori_id = '585c2130f31b2fbff4efbf68';
var kori_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/kori.png';
var dummy_user_mitchell_id = '586ecdc0213f22d94db5ef7f';
var mitchell_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/mitchell.png';
var dummy_user_allen_id = '5881130a387e980f48c743f7';
var allen_avatar_url = 'https://d33833kh9ui3rd.cloudfront.net/allen.png';

// Dummy project + task
var dummy_task_ids = ['586ebcae9188e7b6bfdd85c4', '58a4a8c2800575168e6540a1', '58a4aad7b9b05716731911c8', '58a4da3f17c40703dcf50321'];
var dummy_task_names = ['Hummingbird iOS App', 'Hummingbird Android App', 'Hummingbird Gmail Plugin', 'Hummingbird Slack Bot'];

// 1 day in ms, 2 days, ... 
var dummy_task_due_dates = [Date.now() + 86400000, Date.now() + 172800000, Date.now() + 259200000, Date.now() + 345600000];

// 2 tasks assigned to kori - one from me and one from allen
// 2 tasks assigned to me - one from kori and one from allen
// 2 tasks assigned to allen - one from kori and one from me

// Constants
var USER_COUNT = 17;
var TASK_COUNT = 50;
var ITEM_COUNT = 5;

var task_statuses = ['pending', 'in_progress', 'completed'];

mongoose.connection.on('connected', function() {
    logger.silly('Mongoose default connection open');
    startSeed();
}); 

function startSeed() {
    var mitchell;
    var kori;
    var allen; 

    var design_first_apps_team;
    var users;
    var tasks;

    dropDb()
    .then(createTeam)
    .then(function(team) {
        design_first_apps_team = team;
        return createDummyKoriUser();
    })
    .then(function(kori_user) {
        kori = kori_user;
        return createDummyMitchellUser();
    })
    .then(function(mitchell_user) {
        mitchell = mitchell_user;
        return createDummyAllenUser();
    })
    .then(function(allen_user) {
        allen = allen_user;
        return createUsers();
    })
    .then(function(dummy_users) {
        users = dummy_users;
        return createMitchellCreatedTasks();
    })
    .then(createMitchellReceivedTasks)
    .then(handleSeedSuccess)
    .catch(handleSeedError);

    function dropDb() {
    logger.silly('dropping db');
    return mongoose.connection.db.dropDatabase();
}

function createTeam() {
    logger.silly('creating design first apps team');
    var team = new Team({
        domain: 'designfirstapps.com'
    });
    return team.save();
}

function createDummyKoriUser() {  
        logger.silly('creating kori dummy user');

		var user = new User({
			_id: new mongoose.mongo.ObjectId(dummy_user_kori_id),
            name: 'Kori Handy',
            password: '1234',
            email_address: 'kori@designfirstapps.com',
            position: 'CEO',
            avatar_url: kori_avatar_url,
            team: design_first_apps_team
		});
		return user.save();
    }

    function createDummyMitchellUser() {
        logger.silly('creating mitchell dummy user');
        
		var user = new User({
			_id: new mongoose.mongo.ObjectId(dummy_user_mitchell_id),
            name: 'Mitchell Porter',
            password: '1234',
            email_address: 'mitchell@designfirstapps.com',
            position: 'iOS Developer',
            avatar_url: mitchell_avatar_url,
            team: design_first_apps_team
		});
		return user.save();
    }

    function createDummyAllenUser() {
        logger.silly('creating allen dummy user');
        
		var user = new User({
			_id: new mongoose.mongo.ObjectId(dummy_user_allen_id),
            name: 'Allen Hurst',
            password: '1234',
            email_address: 'allen@designfirstapps.com',
            position: 'iOS Developer',
            avatar_url: allen_avatar_url,
            team: design_first_apps_team
		});
		return user.save();
    }

    function createUsers() {
        logger.silly('Creating users');
        var users = [mitchell, kori, allen];
        for (var x = 0; x < USER_COUNT; x++) {
            var user = new User({
                name: casual.first_name + ' ' + casual.last_name,
                password: '1234',
                email_address: casual.email,
                avatar_url: randomAvatarURL(),
                position: randomPosition(),
                team: design_first_apps_team
            });            
            users.push(user);
        }
        return User.create(users);
    }

    function createMitchellCreatedTasks() {
        logger.silly('creating mitchell created tasks');
        var tasks = [];
        for (var x = 0; x < TASK_COUNT; x++) {
            var task = new Task({
                assigner: mitchell,
                assignees: users[Math.floor(Math.random() * users.length)]._id,
                title: casual.title,
                details: casual.description,
                due_date: randomDueDate(), // optional
                status: task_statuses[Math.floor(Math.random() * task_statuses.length)],
                completion_percentage: randomCompletionPercentage()
            });
            tasks.push(task);
        }
        return Task.create(tasks);
    }

    function createMitchellReceivedTasks() {
        logger.silly('creating mitchell received tasks');
        var tasks = [];
        for (var x = 0; x < TASK_COUNT; x++) {
            var task = new Task({
                assigner: users[Math.floor(Math.random() * users.length)]._id,
                assignees: mitchell,
                title: casual.title,
                details: casual.description,
                due_date: randomDueDate(), // optional
                status: task_statuses[Math.floor(Math.random() * task_statuses.length)],
                completion_percentage: randomCompletionPercentage()
            });
            tasks.push(task);
        }
        return Task.create(tasks);
    }

    function finishSeeding() {
        logger.silly('finished seeding db');
        process.exit();
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