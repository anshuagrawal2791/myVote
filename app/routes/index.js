'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/handlers/clickHandler.server.js');
var UserHandler = require('../handlers/userHandler.server');
module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			res.redirect('/index');
		}
	}

	var clickHandler = new ClickHandler(passport);
    var userHandler = new UserHandler(passport);
	app.route('/')
		.get(isLoggedIn,function (req, res) {
            console.log('this called');
            console.log(req.user);
			res.sendFile(path + '/public/user.html');
        });
        
    app.get('/index',(req,res)=>{
        res.sendFile(path + '/public/index.html');
    });
	app.route('/login')
		// .get(function (req, res) {
		// 	res.sendFile(path + '/public/login.html');
        // });
        
        app.route('/signup')
		// .get(function (req, res) {
		// 	res.sendFile(path + '/public/signup.html');
        // })
        .post((req,res)=>{
            userHandler.addUser(req,res);
        });
        
        
    app.route('/login')
        .post(passport.authenticate('local',{
                successRedirect: '/',
                failureRedirect: '/signup'
        }));
    
    
          app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});


    app.route('/user')
    .get(isLoggedIn,(req,res)=>{
        res.sendFile(path + '/public/user.html');
    });


	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
