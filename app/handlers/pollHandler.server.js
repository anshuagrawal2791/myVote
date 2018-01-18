var Users = require('../models/users');
var Polls = require('../models/polls');

function PollHandler() {

    // to create new poll 
    this.addPoll = (req, res) => {
        var opts = [];
        for (var i = 0; i < JSON.parse(req.body.options).length; i++) {
            var opt = JSON.parse(req.body.options)[i];
            var cur = {
                option: opt,
                score: 0
            }
            opts.push(cur);
        }
        var poll = new Polls({
            name: req.body.name,
            options: opts
        });

        poll.save((err) => {
            if (err)
                res.status(400).send(err);

                // add poll to the user's document
            Users.update(
                { _id: req.user },
                { $push: { polls: poll.id } },
                (done) => {
                    delete poll.voters;
                    res.json({ 'poll': poll });
                }
            );
        });

    }

    // utility function to find poll by id
    this.getPollById = (req, res) => {
        Polls.findById(req.body.poll_id, (err, poll) => {
            console.log(req.body);
            if (err)
                return res.status(400).send(err);
            res.status(200).json(poll);
        });
    }

    // called when a user votes on a poll
    this.update = (req, res,socket) => {
        Polls.findById(req.body.poll_id, (err, poll) => {
            if (err)
                return res.status(400).send(err);

            // to ensure one vote per person
            if (contains(req.user, poll.voters)) {
                return res.status(400).send('only one vote per user');
            }


            poll.options[req.body.option].score += 1;

            var voters = poll.voters;
            voters.push(req.user);
            poll.voters = voters;
            poll.save((err) => {
                if (err)
                    return res.status(400).send(err);
                // delete voters to reduce response size
                delete poll.voters;
                // broadcast result to all the viewers 
                socket.sockets.emit('vote',poll);
                res.status(200).json(poll);
            })

        })
    }
    // utility function to check if the user has voted on the given poll
    var contains = (userId, voters) => {
        for (var i = 0; i < voters.length; i++) {
            if (voters[i] == userId)
                return true;
        }
        return false;
    }
};

module.exports = PollHandler;