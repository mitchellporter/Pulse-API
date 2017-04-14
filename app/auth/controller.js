const User = require('../users/userModel');
const signToken = require('./auth').signToken;

exports.signin = function(req, res, next) {
  // req.user will be there from the middleware
  // verify user. Then we can just create a token
  // and send it back for the client to consume
  var user = req.user;
  var token = signToken(user._id);
  res.json({
  	'success': true,
  	'token': token,
  	'user': user
  });
};
