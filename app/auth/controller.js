const User = require('../users/user');
const signToken = require('./auth').signToken;

exports.signin = function(req, res, next) {
  // req.user will be there from the middleware
  // verify user. Then we can just create a token
  // and send it back for the client to consume
  var user = req.user;
  var token = signToken(user._id);
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 3);

  // TODO: Needs final params
  res.cookie('token', token, {
    httpOnly: false,
    expires: expiry
  });
      
  res.json({
    success: true,
    token: token,
    user: user
  });
};
