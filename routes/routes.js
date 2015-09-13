var uuid        = require("uuid");
var async       = require("async");

var bucket      = require("../app.js").bucket;
var couchbase   = require('couchbase');
var N1qlQuery   = require('couchbase').N1qlQuery;

var appRouter = function(app) {

    app.post("/api/upvote", function(req, res) {
        var updatedID = req.body.songID + "_" + req.body.playlistChannel;
        var changeVote = N1qlQuery.fromString("UPDATE `CrowdPlay` USE KEYS ($1) SET voteCount = voteCount + 1");
        console.log(changeVote);
        bucket.query(changeVote, [updatedID], function(error, result) {
            if (error) {
                console.log(error);
                res.send('we dun goofed the upvote');
                return;
            }
            console.log(result);
            res.send(result);
        });
    });

    app.post("/api/downvote", function(req, res) {
        var updatedID = req.body.songID + "_" + req.body.playlistChannel;
        var changeVote = N1qlQuery.fromString("UPDATE `CrowdPlay` USE KEYS ($1) SET voteCount = voteCount - 1");
        console.log(changeVote);
        bucket.query(changeVote, [updatedID], function(error, result) {
            if (error) {
                console.log(error);
                res.send('we dun goofed the downvote');
                return;
            }
            console.log(result);
            res.send(result);
        });
    });

    app.post("/api/addSong", function(req, res) {
        console.log(req.body);
        var songObj = {
            playlistChannel: req.body.playlistChannel,
            songID: req.body.songID,
            genre: req.body.genre,
            image: req.body.image,
            songName: req.body.songName,
            type: "song",
            nowPlaying: false,
            voteCount: 1,
            songLength: req.body.songLength,
            songTime: 0
        };
        var insertSong = N1qlQuery.fromString("UPSERT INTO `CrowdPlay` (KEY, VALUE) VALUES (\""+songObj.songID+"_"+songObj.playlistChannel+"\", "+JSON.stringify(songObj)+")");
        //var insertSong = N1qlQuery.fromString("SELECT * FROM `CrowdPlay`");
        console.log(insertSong);
        bucket.query(insertSong, function (error, result) {
            if (error) {
                console.log(error);
                return res.status(400).send(error);
            }
            console.log(result);
            res.send('song inserted');
        });
    });

    app.get("/api/getAllSongs", function(req, res) {
        var getSongs = N1qlQuery.fromString("SELECT * FROM `CrowdPlay` WHERE type=\"song\" AND playlistChannel = $1 ORDER BY voteCount DESC, songName");
        //AND playlistChannel = $1
        console.log(getSongs);
        bucket.query(getSongs, [req.query.playlistChannel],/*[req.query.playlistChannel],*/ function(error, result) {
            if (error) {
                console.log(error);
                res.send('getting songs dun goofed');
                return;
            }
            console.log(result);
            if (result.length === 0) {
                res.send({'noContent': 'There are currently no songs in this playlist. Go ahead and add some!'});
                return;
            }
            res.json(result);
        });
    });

    app.post("/api/createChannel", function(req, res) {
        var channelID = req.body.playlistChannel + "_channel";
        var checkChannel = N1qlQuery.fromString("SELECT * FROM `CrowdPlay` WHERE type=\"channel\" AND playlistChannel = $1");
        bucket.query(checkChannel, [req.body.playlistChannel], function(error, result) {
            if (error) {
                console.log(result);
                res.send('shit, checkChannel dun goofed');
                return;
            }
            console.log(result);
            if (result.length > 0) {
                res.send({'channelExists': 'This channel already exists. You can join it, or pick a different ID.'});
                return;
            }
            var channelObj = {
                playlistChannel: req.body.playlistChannel,
                numJoins: 1,
                type:"channel"
            };
            var insertChannel = N1qlQuery.fromString("UPSERT INTO `CrowdPlay` (KEY, VALUE) VALUES ($1, $2)");
            console.log(insertChannel);
            bucket.query(insertChannel, [channelID, channelObj], function(err, result) {
                if (err) {
                    console.log(err);
                    res.send('insertChannel dun goofed, ballz');
                    return;
                }
                console.log(result);
                res.send({'playlistChannel': channelObj.playlistChannel});
            });
        });
    });

    app.post("/api/joinChannel", function(req, res) {
        var checkChannel = N1qlQuery.fromString("SELECT * FROM `CrowdPlay` WHERE type=\"channel\" AND playlistChannel = $1");
        console.log(checkChannel);
        console.log(req.body);
        bucket.query(checkChannel, [req.body.playlistChannel], function(error, result) {
            if (error) {
                console.log(result);
                res.send('shit, checkChannel dun goofed');
                return;
            }
            if (result.length === 0) {
                console.log('none found');
                res.send({'channelDNE': 'This channel does not exist. Please create it, or try again.'});
                return;
            }
            console.log(result);
            console.log('channel joined!')
            var updateChannelCount = N1qlQuery.fromString("UPDATE `CrowdPlay` USE KEYS($1) SET numJoins = numJoins + 1");
            bucket.query(updateChannelCount, [req.body.playlistChannel], function(err, result) {
                if (err) {
                    console.log(result);
                    res.send('updateChannelCount dun goofed');
                    return;
                }
                console.log(result);
                res.send({'playlistChannel': req.body.playlistChannel});
            });
        });
    });

};

module.exports = appRouter;