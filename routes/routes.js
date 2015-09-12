var uuid        = require("uuid");
var async       = require("async");

var bucket = require("../app").CrowdPlay;
var N1qlQuery   = require('couchbase').N1qlQuery;

var appRouter = function(app) {

    app.post("/api/upvote", function(req, res) {
        var changeVote = N1qlQuery.fromString("UPDATE `CrowdPlay` USE KEYS ($1) SET voteCount = voteCount + 1");
        bucket.query(changeVote, [req.body.songID], function(error, result) {
            if (error) {
                console.log(error);
                res.send('we dun goofed the upvote');
                return;
            }
            console.log(result);
        });
    });

    app.post("/api/downvote", function(req, res) {
        var changeVote = N1qlQuery.fromString("UPDATE `CrowdPlay` USE KEYS ($1) SET voteCount = voteCount - 1");
        bucket.query(changeVote, [req.body.songID], function(error, result) {
            if (error) {
                console.log(error);
                res.send('we dun goofed the downvote');
                return;
            }
            console.log(result);
        });
    });

    app.post("/api/addSong", function(req, res) {
        var songObj = {
            playlistChannel: req.body.playlistChannel,
            songID: req.body.songID,
            artist: req.body.artist,
            genre: req.body.genre,
            image: req.body.image,
            songName: req.body.songName,
            type: "song",
            nowPlaying: false,
            voteCount: 1,
            songTime: req.body.songTime
        }
        var insertSong = N1qlQuery.fromString("INSERT INTO `CrowdPlay` (KEY, VALUE) VALUES ("+songObj.songID+", "+songObj+")");
        bucket.query(insertSong, function(error, result) {
            if (error) {
                console.log(error);
                res.send('song did not insert, goofed');
                return;
            }
            console.log(result);
        });
    });

    app.get("/api/getAllSongs", function(req, res) {
        var getSongs = N1qlQuery.fromString("SELECT * FROM `CrowdPlay` WHERE type=\"song\" AND playlistChannel = $1");
        bucket.query(getSongs, [req.query.playlistChannel], function(error, result) {
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
        });
    });

    app.post("/api/createChannel", function(req, res) {
        var checkChannel = N1qlQuery.fromString("SELECT * FROM `CrowdPlay` WHERE type=\"channel\" AND playlistChannel = $1");
        bucket.query(checkChannel, [req.body.playlistChannel], function(error, result) {
            if (error) {
                console.log(result);
                res.send('shit, checkChannel dun goofed');
                return;
            }
            console.log(result);
            var channelObj = {
                playlistChannel: req.body.playlistChannel,
                numJoins: 1,
                type="channel"
            }
            var insertChannel = N1qlQuery.fromString("INSERT INTO `CrowdPlay` (KEY, VALUE) VALUES ("+channelObj.playlistChannel+"_channel, "+channelObj")");
            bucket.query(insertChannel, function(err, result) {
                if (err) {
                    console.log(err);
                    res.send('insertChannel dun goofed, ballz');
                    return;
                }
                console.log(result);
                res.send('CHANNEL CREATED :)');
            });
        });
    });

    app.post("/api/joinChannel", function(req, res) {
        var checkChannel = N1qlQuery.fromString("SELECT * FROM `CrowdPlay` WHERE type=\"channel\" AND playlistChannel = $1");
        bucket.query(checkChannel, [req.body.playlistChannel], function(error, result) {
            if (error) {
                console.log(result);
                res.send('shit, checkChannel dun goofed');
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

module.exports = appRouter;