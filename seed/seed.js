'use strict'

const async = require('async');
const casual = require('casual');
const faker = require('faker');
const Promise = require('bluebird');
const config = require('../config/config');
const mongoose = require('mongoose').connect(config.mongo_url);
mongoose.Promise = Promise;

const logger = require('../lib/logger');
const Team = require('../app/teams/teamModel');
const User = require('../app/users/userModel');
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

mongoose.connection.on('connected', function () {
    logger.silly('Mongoose default connection open');
    dropDb()
    .then(startSeed)
    .catch(handleSeedError);
});

function startSeed() {
    logger.silly('starting seed...');

    async.auto({
        team: createTeam,
        createMitchellUser,
        createKoriUser,
        createAllenUser,
        createMikeUser,
    }, (err, results) => {
        if (err) return handleSeedError(err);
        handleSeedSuccess();
    });
}

function dropDb() {
    logger.silly('dropping db');
    return mongoose.connection.db.dropDatabase();
}

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

function handleSeedSuccess() {
    logger.silly('successfully seeded db');
    process.exit();
}

function handleSeedError(err) {
    logger.error('seed error: ' + err);
    process.exit();
}