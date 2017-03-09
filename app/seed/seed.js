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

var task_id = '586ebcae9188e7b6bfdd85c4';
var mitchell_received_task_id = '58c0b10f10f3aa4b62cf01ba';
var task_invitation_id = '58bf269e9b5a8ff83f9a94e2';
var team_id = '58b080b2356e913f3a3af182';
var item_id = '58b09c7c247aa67459185307';
var update_request_id = '58b5f0a5e095de16fe4c2cda';

// Constants
var USER_COUNT = 17;
var RECEIVED_TASKS_IN_PROGRESS_COUNT = 5;
var RECEIVED_TASKS_COMPLETED_COUNT = 5;
var ITEM_COUNT = 5;
var SENT_UPDATE_REQUEST_COUNT = 5;
var RECEIVED_UPDATE_REQUEST_COUNT = 5;
var TASK_INVITATION_COUNT = 5;

var task_invitation_statuses = ['pending', 'accepted', 'denied'];
var task_statuses = ['pending', 'in_progress', 'completed'];
var item_statuses = ['in_progress', 'completed'];
var update_days = ['monday', 'wednesday', 'friday'];

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
    var final_tasks = [];
    var mitchell_created_tasks = [];

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
    .then(createMitchellReceivedTasksInProgress) // x
    .then(createMitchellReceivedTasksCompleted) // x
    .then(createTaskInvitationsSentToMitchell) // x
    .then(createTaskInvitationsSentByMitchell) // x
    .then(createMitchellSentUpdateRequests) // x
    .then(createMitchellReceivedUpdateRequests) // x
    .then(createUpdatesReceivedByMitchellForAllTasks)
    .then(createKoriReceivedTasksInProgress)
    .then(createKoriReceivedTasksCompleted)
    .then(createItemsForAllTasks)
    .then(createKoriSentUpdateRequests)
    .then(createKoriReceivedUpdateRequests)
    .then(createTaskInvitationsSentToKori)
    .then(createTaskInvitationsSentToKori)
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
    team._id = team_id;
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
        var users = [kori, allen];
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
        for (var x = 0; x < 10; x++) {
            var task = new Task({
                assigner: mitchell,
                assignees: users[Math.floor(Math.random() * users.length)]._id,
                title: casual.title,
                details: casual.description,
                due_date: randomDueDate(), // optional
                status: task_statuses[Math.floor(Math.random() * task_statuses.length)],
                update_day: update_days[Math.floor(Math.random() * update_days.length)],
                completion_percentage: randomCompletionPercentage()
            });
            if (tasks.length == 0) task._id = task_id;
            tasks.push(task);
            mitchell_created_tasks.push(task);
        }
        return Task.create(tasks);
    }

    function createItemsForAllTasks() {
        var seed_item_key_used = false;
        return new Promise(function(resolve, reject) {
            async.forEachOf(final_tasks, function (value, key, callback) {
            var task = value;
            logger.silly('creating items for tasks');
            var items = [];
            for (var y = 0; y < ITEM_COUNT; y++) {
                // Create 5 items for each task
                var item = new Item({
                    text: casual.title,
                    status: item_statuses[Math.floor(Math.random() * item_statuses.length)]
                });
                if (seed_item_key_used === false) {
                    item._id = item_id;
                    seed_item_key_used = true;
                }
                items.push(item);
            }
            logger.silly('About to save this many items: ' + items.length);
            Item.create(items)
            .then(function(items) {
                task.items = items
                task.isNew = false;
                task.save()
                .then(function(task) {
                    callback();
                })
            })
            .catch(callback);
        }, function (err) {
            if (err) return reject(err);
            resolve();
        });
        });
    }

    function createMitchellReceivedTasksInProgress(tasks) {
        if (tasks && tasks.length != 0) final_tasks = final_tasks.concat(tasks);

        logger.silly('creating tasks received by mitchell and in progress');

        var tasks = [];
        for (var x = 0; x < RECEIVED_TASKS_IN_PROGRESS_COUNT; x++) {
            var task = new Task({
                assigner: users[Math.floor(Math.random() * users.length)]._id,
                assignees: mitchell,
                title: '' + x,
                details: casual.description,
                due_date: randomDueDate(), // optional
                status: 'in_progress',
                update_day: update_days[Math.floor(Math.random() * update_days.length)],
                completion_percentage: randomCompletionPercentage()
            });
            if (tasks.length == 0) task._id = mitchell_received_task_id;
            tasks.push(task);
        }
        return Task.create(tasks);
    }

    function createKoriReceivedTasksInProgress(tasks) {
        if (tasks && tasks.length != 0) final_tasks = final_tasks.concat(tasks);

        logger.silly('creating tasks received by kori and in progress');

        var tasks = [];
        for (var x = 0; x < RECEIVED_TASKS_IN_PROGRESS_COUNT; x++) {
            var task = new Task({
                assigner: users[Math.floor(Math.random() * users.length)]._id,
                assignees: kori,
                title: '' + x,
                details: casual.description,
                due_date: randomDueDate(), // optional
                status: 'in_progress',
                update_day: update_days[Math.floor(Math.random() * update_days.length)],
                completion_percentage: randomCompletionPercentage()
            });
            tasks.push(task);
        }
        return Task.create(tasks);
    }

    function createMitchellReceivedTasksCompleted(tasks) {
        if (tasks && tasks.length != 0) final_tasks = final_tasks.concat(tasks);
        logger.silly('creating tasks received by mitchell and completed');

        var tasks = [];
        for (var x = 0; x < RECEIVED_TASKS_COMPLETED_COUNT; x++) {
            var task = new Task({
                assigner: users[Math.floor(Math.random() * users.length)]._id,
                assignees: mitchell,
                title: '' + x,
                details: casual.description,
                due_date: randomDueDate(), // optional
                status: 'completed',
                update_day: update_days[Math.floor(Math.random() * update_days.length)],
                completion_percentage: randomCompletionPercentage()
            });
            tasks.push(task);
        }
        return Task.create(tasks);
    }

    function createKoriReceivedTasksCompleted(tasks) {
        if (tasks && tasks.length != 0) final_tasks = final_tasks.concat(tasks);
        logger.silly('creating tasks received by mitchell and completed');

        var tasks = [];
        for (var x = 0; x < RECEIVED_TASKS_COMPLETED_COUNT; x++) {
            var task = new Task({
                assigner: users[Math.floor(Math.random() * users.length)]._id,
                assignees: kori,
                title: '' + x,
                details: casual.description,
                due_date: randomDueDate(), // optional
                status: 'completed',
                update_day: update_days[Math.floor(Math.random() * update_days.length)],
                completion_percentage: randomCompletionPercentage()
            });
            tasks.push(task);
        }
        return Task.create(tasks);
    }

    // 1. Loop through all tasks
    // 2. Create 5 items for each task
    // 3. Save the items
    // 4. Loop through the saved items, populate their task, add the item to the task's item array, and save the task
    function createItems() {

        // final_tasks = final_tasks.concat(tasks);

        logger.silly('creating items for tasks');
        var items = [];
        for (var y = 0; y < ITEM_COUNT; y++) {
            // Create 5 items for each task
            var item = new Item({
                text: casual.title,
                status: item_statuses[Math.floor(Math.random() * item_statuses.length)]
            });
            if(items.length == 0) item._id = item_id;
            items.push(item);
        }
        logger.silly('About to save this many items: ' + items.length);
       return Item.create(items);
    }

    function addItemsToTasks(items) {
        logger.silly('Adding items to tasks');

        return new Promise(function (resolve, reject) {
            async.forEachOf(final_tasks, function (value, key, callback) {
                var task = value;
                task.items = items
               task.save()
               .then(function(task) {
                   callback();
               })
               .catch(callback);
            }, function (err) {
                if (err) logger.error('add items to tasks error: ' + err);
                if (err) return reject(err);
                return resolve();
            });
        });
    }

    function createTaskInvitationsSentToMitchell(tasks) {
        if (tasks && tasks.length != 0) final_tasks = final_tasks.concat(tasks);

        logger.silly('creating task invitations sent to Mitchell');
        var task_invitations = [];
        for (var x = 0; x < TASK_INVITATION_COUNT; x++) {
            var task_invitation = new TaskInvitation({
                sender: users[Math.floor(Math.random() * users.length)],
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)],
                receiver: mitchell,
                status: task_invitation_statuses[Math.floor(Math.random() * task_invitation_statuses.length)]
            });
            if (task_invitations.length == 0) {
                logger.silly('ZERO TASK INVITATIONS');

                task_invitation._id = task_invitation_id;
            }
            task_invitations.push(task_invitation);
        }
        return TaskInvitation.create(task_invitations);
    }

    function createTaskInvitationsSentToKori(tasks) {
        if (tasks && tasks.length != 0) final_tasks = final_tasks.concat(tasks);

        logger.silly('creating task invitations sent to Mitchell');
        var task_invitations = [];
        for (var x = 0; x < TASK_INVITATION_COUNT; x++) {
            var task_invitation = new TaskInvitation({
                sender: users[Math.floor(Math.random() * users.length)],
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)],
                receiver: kori,
                status: task_invitation_statuses[Math.floor(Math.random() * task_invitation_statuses.length)]
            });
            task_invitations.push(task_invitation);
        }
        return TaskInvitation.create(task_invitations);
    }

    function createTaskInvitationsSentByMitchell() {
        logger.silly('creating task invitations sent by Mitchell');
        var task_invitations = [];
        for (var x = 0; x < TASK_INVITATION_COUNT; x++) {
            var task_invitation = new TaskInvitation({
                sender: mitchell,
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)],
                receiver: users[Math.floor(Math.random() * users.length)],
                status: task_invitation_statuses[Math.floor(Math.random() * task_invitation_statuses.length)]
            });
            task_invitations.push(task_invitation);
        }
        return TaskInvitation.create(task_invitations);
    }

    function createTaskInvitationsSentByKori() {
        logger.silly('creating task invitations sent by Mitchell');
        var task_invitations = [];
        for (var x = 0; x < TASK_INVITATION_COUNT; x++) {
            var task_invitation = new TaskInvitation({
                sender: kori,
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)],
                receiver: users[Math.floor(Math.random() * users.length)],
                status: task_invitation_statuses[Math.floor(Math.random() * task_invitation_statuses.length)]
            });
            task_invitations.push(task_invitation);
        }
        return TaskInvitation.create(task_invitations);
    }

    function createMitchellSentUpdateRequests() {
        logger.silly('creating update requests sent by Mitchell');

        var update_requests = [];
        for (var x = 0; x < SENT_UPDATE_REQUEST_COUNT; x++) {
            var update_request = new UpdateRequest({
                sender: mitchell,
                receiver: kori,
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)]
            });
            if (x == 0) update_request._id = update_request_id;
            update_requests.push(update_request);
        }
        return UpdateRequest.create(update_requests);
    }

    function createKoriSentUpdateRequests() {
        logger.silly('creating update requests sent by Mitchell');

        var update_requests = [];
        for (var x = 0; x < SENT_UPDATE_REQUEST_COUNT; x++) {
            var update_request = new UpdateRequest({
                sender: kori,
                receiver: mitchell,
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)]
            });
            update_requests.push(update_request);
        }
        return UpdateRequest.create(update_requests);
    }

    function createMitchellReceivedUpdateRequests() {
        logger.silly('creating update requests received by Mitchell');

        var update_requests = [];
        for (var x = 0; x < RECEIVED_UPDATE_REQUEST_COUNT; x++) {
            var update_request = new UpdateRequest({
                sender: users[Math.floor(Math.random() * users.length)],
                receiver: mitchell,
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)]
            });
            update_requests.push(update_request);
        }
        return UpdateRequest.create(update_requests);
    }

    function createKoriReceivedUpdateRequests() {
        logger.silly('creating update requests received by Mitchell');

        var update_requests = [];
        for (var x = 0; x < RECEIVED_UPDATE_REQUEST_COUNT; x++) {
            var update_request = new UpdateRequest({
                sender: users[Math.floor(Math.random() * users.length)],
                receiver: kori,
                task: final_tasks[Math.floor(Math.random() * final_tasks.length)]
            });
            update_requests.push(update_request);
        }
        return UpdateRequest.create(update_requests);
    }

    function createUpdatesReceivedByMitchell() {
        logger.silly('creating updates received by Mitchell');

        var updates = [];
        for (var x = 0; x < 10; x++) {
            var update = new Update({
                sender: users[Math.floor(Math.random() * users.length)],
                receiver: mitchell,
                task: mitchell_created_tasks[Math.floor(Math.random() * mitchell_created_tasks.length)],
                completion_percentage: randomCompletionPercentage()
            });
            updates.push(update);
        }
        return Update.create(updates);
    }

    function addUpdatesReceivedByMitchellToTasks(updates) {
        logger.silly('adding updates received by Mitchell to tasks updates array');

        return new Promise(function (resolve, reject) {
            async.forEachOf(mitchell_created_tasks, function (value, key, callback) {
                var task = value;
                task.updates = updates
               task.save()
               .then(function(task) {
                   callback();
               })
               .catch(callback);
            }, function (err) {
                if (err) logger.error('add updates to tasks error: ' + err);
                if (err) return reject(err);
                return resolve();
            });
        });
    }

    function createUpdatesReceivedByMitchellForAllTasks() {
        var seed_item_key_used = false;
        return new Promise(function(resolve, reject) {
            async.forEachOf(mitchell_created_tasks, function (value, key, callback) {
            var task = value;

            logger.silly('creating updates for mitchell created tasks');
            var updates = [];
            for (var y = 0; y < 5; y++) {
                // Create 5 items for each task
                var update = new Update({
                    sender: users[Math.floor(Math.random() * users.length)],
                    receiver: mitchell,
                    task: mitchell_created_tasks[Math.floor(Math.random() * mitchell_created_tasks.length)],
                    completion_percentage: randomCompletionPercentage()
                });
                
                updates.push(update);
            }
            logger.silly('About to save this many updates: ' + updates.length);
            Update.create(updates)
            .then(function(updates) {
                task.updates = updates
                task.isNew = false;
                task.save()
                .then(function(task) {
                    callback();
                })
            })
            .catch(callback);
        }, function (err) {
            if (err) return reject(err);
            resolve();
        });
        });
    }

    function createUpdatesSentByMitchell() {
        
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