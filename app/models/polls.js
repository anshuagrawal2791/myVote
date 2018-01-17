'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    name:String,
    options: [{
        option : String,
        score : Number
         }],
    voters : {type:[String]}  
    
});

module.exports = mongoose.model('Poll', Poll);
