'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/handlers/clickHandler.server.js');
var UserHandler = require('../handlers/userHandler.server');
const jwt = require('jsonwebtoken');
const url = require('url');
module.exports = function (app, passport) {

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/');
        }
    }

    var clickHandler = new ClickHandler(passport);
    var userHandler = new UserHandler(passport);

}