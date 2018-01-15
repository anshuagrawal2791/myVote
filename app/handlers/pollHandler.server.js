var Users = require('../models/users');
var Polls = require('../models/polls');

function PollHandler(){

    this.addPoll = (req,res)=>{
        var opts=[];
        console.log(req.body);
        for(var i=0;i<JSON.parse(req.body.options).length;i++){
            var opt = JSON.parse(req.body.options)[i];
            var cur = {option:opt,
            score:0}
            opts.push(cur);
        }
        console.log('opts:    '+opts);
        var poll = new Polls({
            name:req.body.name,
            options:opts
        });
        
        poll.save((err)=>{
            if(err)
                console.log(err);

                Users.update(
                    { _id: req.user}, 
                    { $push: { polls: poll.id } },
                    (done)=>{
                        
                        res.json({'poll':poll});
                    }
                );
        });
        




        Users.findById(req.user,(err,user)=>{
           
        });
    }
};

module.exports = PollHandler;