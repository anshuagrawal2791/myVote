'use strict';

var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/users');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

module.exports = function (passport) {
	
	
	// Local strategy to verify using email and password
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },
  function(username, password, done) {
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!validPassword(password,user)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user.id);
    });
  }
));

// to verify using the JWT token
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : process.env.JWT_KEY
},
function (jwtPayload, cb) {
    return User.findById(jwtPayload)
        .then(user => {
            return cb(null, user.id);
        })
        .catch(err => {
            return cb(err);
        });
}
));



// to validate the sent password with the stored hashed password using salt from the database
function validPassword(password, user){
    let temp = user.salt; 
	let hash_db = user.hashed_password; 
    let newpass = temp + password; 
    let hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
    return hashed_password==hash_db; 
}

};
