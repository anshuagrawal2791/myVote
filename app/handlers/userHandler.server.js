'use strict';

var Users = require('../models/users.js');
const rand = require('csprng'); 
var crypto =require('crypto');
const jwt = require('jsonwebtoken');

function UserHandler (passport) {

	this.getUser = function (req, res) {
		Users
			.findOne({ 'email': req.user.email }, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }

				res.json(result);
			});
	};

    this.getUserById = function (req, res) {
		Users
			.findById(req.user, { '_id': false, password:0, hashed_password:0 })
			.exec(function (err, result) {
				if (err) { throw err; }

				res.json(result);
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
                    const token = jwt.sign(newUser.id, process.env.JWT_KEY);
                    console.log('created user'+newUser.toString()+' with token '+ token);
                    res.json({'token':token});

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
