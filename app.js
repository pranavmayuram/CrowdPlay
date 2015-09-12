// modules for the application
var couchbase       = require('couchbase');
var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var morgan          = require('morgan');
var fs              = require('fs');
var http            = require('http');

// use commands
app.use(bodyParser.urlencoded({extended:true, limit: '4mb'}));
app.use(bodyParser.json({limit: '4mb'}));
app.use(morgan('dev'));

// connect directories to save in memory before app is run, makes filepaths simpler
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/node_modules'));

// create cluster and create buckets using config file
var cluster = new couchbase.Cluster(config.couchbase.server);
module.exports.CrowdPlay = cluster.openBucket('CrowdPlay');

// include API endpoints
var routes = require("./routes/routes.js")(app);

// set up HTTP and HTTPS if possible
var httpServer = http.createServer(app);
httpServer.listen(8000);

console.log('View Touchbase at localhost:' + 8000);
