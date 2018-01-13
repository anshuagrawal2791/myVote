'use strict';

var Users = require('../models/users.js');
const rand = require('csprng'); 
var crypto =require('crypto');

function UserHandler (passport) {

	this.getClicks = function (req, res) {
		Users
			.findOne({ 'github.id': req.user.github.id }, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }

				res.json(result.nbrClicks);
			});
	};

	this.addUser = function (req, res) {
        console.log(req.body);
        let temp =rand(160, 36); 
			let newpass = temp + req.body.password; 
			let hashed_password = crypto.createHash('sha512').update(newpass).digest("hex"); 

         var newUser = new Users({
             email:req.body.email,
             hashed_password: hashed_password,
             salt: temp,
             name:req.body.name
         });
         
         Users.findOne({email:newUser.email},(err,user)=>{
             if(err){
                 throw err;
             }
             if(user){
                 res.json({'response':"Email already Registered",'res':false})
             }else{
                newUser.save((err)=>{
                    if(err)
                    throw err;
                    passport.authenticate('local')(req, res, function () {
                        res.redirect('/');
                    })

                });
             }
         })
	};

	this.resetClicks = function (req, res) {
		Users
			.findOneAndUpdate({ 'github.id': req.user.github.id }, { 'nbrClicks.clicks': 0 })
			.exec(function (err, result) {
					if (err) { throw err; }

					res.json(result.nbrClicks);
				}
			);
	};

}

module.exports = UserHandler;
