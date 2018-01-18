'use strict';

var Users = require('../models/users.js');
var Polls = require('../models/polls');
const rand = require('csprng');
var crypto = require('crypto');
const jwt = require('jsonwebtoken');

function UserHandler(passport) {

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
			.findById(req.user, { '_id': false, password: 0, hashed_password: 0,polls:0, salt:0})
			.exec(function (err, result) {
				if (err) { throw err; }
				res.json(result);
			});
	};

	// user signup
	this.addUser = function (req, res) {
		let temp = rand(160, 36);
		let newpass = temp + req.body.password;
		let hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
		var newUser = new Users({
			email: req.body.email,
			hashed_password: hashed_password,
			salt: temp,
			name: req.body.name
		});
		Users.findOne({ email: newUser.email }, (err, user) => {
			if (err) {
				throw err;
			}
			if (user) {
				res.json({ 'response': "Email already Registered", 'res': false })
			} else {
				newUser.save((err) => {
					if (err)
						throw err;
					const token = jwt.sign(newUser.id, process.env.JWT_KEY);
					res.json({ 'token': token });

				});
			}
		})
	};

	this.getPolls = function (req, res) {
		Users.findById(req.user, (err, user) => {
			if (err)
				return res.status(400).send(err);
			Polls.find({ '_id': { $in: user.polls }},(err, polls) => {
				if (err)
					return res.status(400).send(err);
				else {
					res.json(polls);
				}
			})
		})
	}

	this.changePassword = function (req,res){
		Users.findById(req.user,(err,user)=>{
			if(err)
			return res.status(400).send(err);
			if(!validPassword(req.body.current_password,user)){
				return res.status(400).send('Invalid Current Password');
			}
			let temp = rand(160, 36);
			let newpass = temp + req.body.new_password;
			let hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
			user.hashed_password=hashed_password;
			user.salt=temp;
			user.save((err)=>{
				if(err)
				return res.status(400).send(err);
				res.status(200).send('Password successfully updated');
			})

		});
	}
	var validPassword = function (password, user){
		let temp = user.salt; 
		let hash_db = user.hashed_password; 
		let newpass = temp + password; 
		let hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
		return hashed_password==hash_db; 
	}

}

module.exports = UserHandler;
