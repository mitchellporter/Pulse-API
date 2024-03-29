const logger = require('../../lib/logger');
const Promise = require('bluebird');
const PubNub = require('pubnub');
const pubnub = new PubNub({
    ssl           : false,  // <- enable TLS Tunneling over TCP
    publishKey   : 'pub-c-874ce7f4-a1ce-4e25-bbc5-c3fb8e4c1a24',
    subscribeKey : 'sub-c-007d8d40-d9fc-11e6-b6b1-02ee2ddab7fe',
    secretKey: 'sec-c-MmU5MDFlZTItZTA1ZS00ZmRlLTk3YmMtNTQ4ZWVkZTVhMzdi'
});
const test_pub_channel = 'nodejs_channel'; // messages sent from me
const test_sub_channel = 'ios_channel' // messages from iOS client

// TODO: Need to add a flag here to enable/disable
exports.sendMessage = function(channel, message) {
    // return Promise.resolve();
    return pubnub.publish({
        channel: channel,
        message: message
    });
};

// exports.sendMessage = function(channel, message) {
//     return pubnub.publish({
//         channels: [channel, 'hello_world'],
//         message: message
//     });
// };

// exports.sendMessage = function (channel, message) {
//     var publishConfig = {
//         channel: channel,
//         message: message
//     }
//     return new Promise(function(resolve, reject) {
//         pubnub.publish(publishConfig, function (status, response) {
//             console.log(status, response);
//             resolve(response);
//         });
//     })
// };

// var publishConfig = {
//     channel: test_pub_channel,
//     message: "Hello from nodejs ;)"
// }
// pubnub.publish(publishConfig, function (status, response) {
//     console.log(status, response);
// })

// pubnub.addListener({
//     status: function (statusEvent) {
//         if (statusEvent.category === "PNConnectedCategory") {
//             console.log('pubnub has successfully connected');
//         }
//     },
//     message: function (message) {
//         console.log("New Message!!", message);
//     },
//     presence: function (presenceEvent) {
//         // handle presence
//         console.log('presence event');
//     }
// })

// console.log("Subscribing..");
// pubnub.subscribe({
//     channels: [test_sub_channel]
// }); 