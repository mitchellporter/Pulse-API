'use strict'

const config = require('../../config/config');
const logger = require('../../lib/logger');
const Team = require('../teams/teamModel');
const User = require('../users/userModel');
const Task = require('../tasks/taskModel');
const TaskInvitation = require('../task_invitations/taskInvitationModel');
const Item = require('../items/itemModel');
const Update = require('../updates/updateModel');
const Standup = require('../standups/standupModel');
const async = require('async');
const casual = require('casual');
const faker = require('faker');
const Promise = require('bluebird');
const mongoose = require('mongoose').connect(config.mongo_url);
mongoose.Promise = Promise;

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

mongoose.connection.on('connected', function () {
    logger.silly('Mongoose default connection open');
    startSeed();
});

function startSeed() {
    var mitchell;
    var kori;
    var allen;
    var arch;
    var mike;

    var users = [];
    var tasks = [];

    var design_first_apps_team;
    logger.silly('starting seed process...');

    dropDb()
        .then(createTeams)
        .then(function (teams) {
            design_first_apps_team = teams[0];
            logger.silly('design first team name? ' + design_first_apps_team.name);
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
            return createItunesConnectUser();
        })
        .then(function(itunes_connect_user) {
            return createMike();
        })
        .then(function(mike_user) {
            mike = mike_user;
            users.push(mike);
            return createInProgressTasks();
        })
        .then(function(created_tasks) {
            tasks = created_tasks;
            return createItemsForTasks();
        })
        .then(createPendingTasks)
        .then(createTaskInvitations)
        .then(createRequestedTaskUpdates)
        .then(createStandups)
        .then(createMitchellStandup)
        .then(createKoriStandup)
        .then(createAllenStandup)
        .then(createArchStandup)
        .then(createMikeStandup)
        .then(handleSeedSuccess)
        .catch(handleSeedError)
       

    function dropDb() {
        logger.silly('dropping db');
        return mongoose.connection.db.dropDatabase();
    }

    function createTeams() {
        logger.silly('creating design first apps team');
        var design_first_apps_team = new Team({
            name: 'designfirstapps'
        });
        design_first_apps_team._id = team_id;

        var airship_team = new Team({
            name: 'airship'
        });
        airship_team._id = '58e2a64932666152d98cd7c7';

        return Team.create([design_first_apps_team, airship_team]);
    }

    function createMitchell() {
        logger.silly('creating mitchell user');

        var user = new User({
            _id: new mongoose.mongo.ObjectId(dummy_user_mitchell_id),
            name: 'Mitchell',
            password: '1234',
            email: 'mitchell@designfirstapps.com',
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
            email: 'mitchell@founderfox.io',
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
            email: 'allen@designfirstapps.com',
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
            email: 'pulsegrenade@gmail.com',
            position: 'web dev',
            avatar_url: arch_avatar_url,
            team: design_first_apps_team
        });
        return user.save();
    }

    function createMike() {
        logger.silly('creating mike user');

        var user = new User({
            _id: new mongoose.mongo.ObjectId(dummy_user_mike_id),
            name: 'Mike',
            password: '1234',
            email: 'mike@designfirstapps.com',
            position: 'web dev',
            avatar_url: mike_avatar_url,
            team: design_first_apps_team
        });
        return user.save();
    }

    function createItunesConnectUser() {
        logger.silly('creating itunes connect user');

        var user = new User({
            _id: new mongoose.mongo.ObjectId('58e2f0105ada64faf597857a'),
            name: 'iTunes Connect',
            password: '1234',
            email: 'itunesconnect@designfirstapps.com',
            position: 'App Reviewer',
            avatar_url: randomAvatarURL(),
            team: design_first_apps_team
        });
        return user.save();
    }

    function createInProgressTasks() {
        logger.silly('creating in_progress tasks');
 
        var task_id_used = false;
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
                    assignee: filtered_assignees[0],
                    title: 'This tasks assigner is ' + assigner.name,
                    details: 'description goes here',
                    due_date: randomDueDate(), // optional,
                    status: 'in_progress'
                });

                if (task.assigner != arch && !task_id_used) {
                    task._id = in_progress_task_id;
                    task_id_used = true;
                }
                tasks.push(task);
                callback();
            }, function (err) {
                if (err) return reject(err);
                resolve(Task.create(tasks));
            });
        });
    }

    function createPendingTasks() {
        logger.silly('creating pending tasks');

        var pending_task_id_used = false;
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
                    assignee: filtered_assignees[0],
                    title: 'This tasks assigner is ' + assigner.name,
                    details: 'description goes here',
                    due_date: randomDueDate()
                });

                if (task.assigner != arch && !pending_task_id_used) {
                    logger.silly('pending task hit!');
                    task._id = pending_task_id;
                    pending_task_id_used = true;
                }
        
                tasks.push(task);
                callback();
            }, function (err) {
                if (err) return reject(err);
                resolve(Task.create(tasks));
            });
        });
    }

    function createItemsForTasks() {
        logger.silly('creating items for tasks');

        var item_id_used = false;
        return new Promise(function (resolve, reject) {
            async.forEachOf(tasks, function (value, key, callback) {
                var task = value;

                    var item1 = new Item({
                        text: 'This is a task item 1'
                    });

                    if (task._id == in_progress_task_id && !item_id_used) {
                        item1._id = item_id;
                        item_id_used = true;
                    }

                    var item2 = new Item({
                        text: 'This is a task item 2'
                    });
                    var item3 = new Item({
                        text: 'This is a task item 3'
                    });
                    var item4 = new Item({
                        text: 'This is a task item 4'
                    });
                    var item5 = new Item({
                        text: 'This is a task item 5'
                    });
                    task.items.push(item1);
                    task.items.push(item2);
                    task.items.push(item3);
                    task.items.push(item4);
                    task.items.push(item5);

                    task.isNew = false;
                    task.save()
                    .then(function(task) {
                        callback();
                    })
                    .catch(callback)
                
            }, function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    function createTaskInvitations(tasks) {
        logger.silly('creating task invitations');

        var task_invitation_id_used = false;
        var task_invitations = [];

        return new Promise(function (resolve, reject) {
            async.forEachOf(tasks, function (value, key, callback) {
                var task = value;
                var assignee = task.assignee;

                var task_invitation = new TaskInvitation({
                    sender: task.assigner,
                    receiver: assignee,
                    task: task,
                });

                // Our hardcoded task is now attached to the hardcoded task invitation
                if (task._id == pending_task_id && assignee == arch && !task_invitation_id_used) {
                    task_invitation._id = task_invitation_id;
                    task_invitation_id_used = true;
                }

                task_invitations.push(task_invitation);
                callback(); 
                }, function (err) {
                    if (err) return reject(err);
                    TaskInvitation.create(task_invitations)
                    .then(function(task_invitations) {
                        resolve(task_invitations)
                    })
                    .catch(logger.error);
                });
        });
    }

    function createRequestedTaskUpdates() {
        logger.silly('creating requested task updates');

        return new Promise(function (resolve, reject) {
            async.forEachOf(tasks, function (value, key, callback) {
                var task = value;
                if (task._id == in_progress_task_id) {
                    var update = new Update({
                        _id: update_id,
                        task: task,
                        type: 'requested'
                    });
                    update.generateResponses()
                    .then(function(update) {
                        update.responses.forEach(function(response) {
                            if (response.assignee._id == dummy_user_arch_id) {
                                response._id = response_id;
                            }
                        });
                        return update.save();
                    })
                    .then(function(update) {
                        callback();
                    })
                    .catch(callback);
                    
                } else {
                    var update = new Update({
                        task: task,
                        type: 'requested'
                    });

                    update.generateResponses()
                    .then(function(update) {
                        update.save()
                        .then(function (update) {
                            callback();
                        })
                        .catch(callback);
                    })
                    .catch(callback);
                }
            }, function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    function createStandups() {
        logger.silly('creating standups');

        var standups = [];
        return new Promise((resolve, reject) => {
            async.forEachOf(users, (value, key, callback) => {
                const author = value;
                
                // generate 10 standups
                async.times(10, (n, next) => {
                    const standup = new Standup({
                        text: standup_text,
                        author: author
                    });
                    standups.push(standup);
                    next(null, standup)
                }, (err, standups) => {
                    callback();
                });
            }, err => {
                if (err) return reject(err);
                resolve(Standup.create(standups));
            });
        });
    }

    function createMitchellStandup() {
        const standup = new Standup({
            _id: mitchell_standup_id,
            text: standup_text,
            author: mitchell
        });
        return standup.save();
    }

    function createKoriStandup() {
        const standup = new Standup({
            _id: kori_standup_id,
            text: standup_text,
            author: kori
        });
        return standup.save();
    }

    function createAllenStandup() {
        const standup = new Standup({
            _id: allen_standup_id,
            text: standup_text,
            author: allen
        });
        return standup.save();
    }

    function createArchStandup() {
        const standup = new Standup({
            _id: arch_standup_id,
            text: standup_text,
            author: arch
        });
        return standup.save();
    }

    function createMikeStandup() {
        const standup = new Standup({
            _id: mike_standup_id,
            text: standup_text,
            author: mike
        });
        return standup.save();
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