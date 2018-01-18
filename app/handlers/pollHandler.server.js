var Users = require('../models/users');
var Polls = require('../models/polls');

function PollHandler() {

    this.addPoll = (req, res) => {
        var opts = [];
        console.log(req.body);
        for (var i = 0; i < JSON.parse(req.body.options).length; i++) {
            var opt = JSON.parse(req.body.options)[i];
            var cur = {
                option: opt,
                score: 0
            }
            opts.push(cur);
        }
        console.log('opts:    ' + opts);
        var poll = new Polls({
            name: req.body.name,
            options: opts
        });

        poll.save((err) => {
            if (err)
                console.log(err);

            Users.update(
                { _id: req.user },
                { $push: { polls: poll.id } },
                (done) => {

                    res.json({ 'poll': poll });
                }
            );
        });

    }
    this.getPollById = (req, res) => {
        Polls.findById(req.body.poll_id, (err, poll) => {
            console.log(req.body);
            if (err)
                return res.status(400).send(err);
            res.status(200).json(poll);
        });
    }

    this.update = (req, res,socket) => {
        Polls.findById(req.body.poll_id, (err, poll) => {
            if (err)
                return res.status(400).send(err);

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
                socket.sockets.emit('vote',poll);
                res.status(200).json(poll);
            })

        })
    }
    var contains = (userId, voters) => {
        for (var i = 0; i < voters.length; i++) {
            if (voters[i] == userId)
                return true;
        }
        return false;
    }
};

module.exports = PollHandler;