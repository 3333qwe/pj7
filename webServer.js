"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be implemented:
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

mongoose.connect('mongodb://localhost/cs142project6');
// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.json());
app.get('/', function(request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function(request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    // console.log('/test called with param1 = ', request.params.p1);
    var param = request.params.p1 || 'info';
    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function(err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                // console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            // We got the object - return it in JSON format.
            // console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [{
            name: 'user',
            collection: User
        }, {
            name: 'photo',
            collection: Photo
        }, {
            name: 'schemaInfo',
            collection: SchemaInfo
        }];
        async.each(collections, function(col, done_callback) {
            // console.log(col.collection);
            col.collection.count({}, function(err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function(err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function(request, response) {
    console.log("fetching user/list");
    // mongoose.connection.on('open', function ()  {
    // console.log("database open");
    // Can start processing model fetch requests
    User.find({}, "id first_name last_name", function(err, users) {
        /*
              users is an array of objects
              */
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            // console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(500).send('Missing users');
            return;
        }
        // console.log('users', users);
        response.end(JSON.stringify(users));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function(request, response) {
    var userId = request.params.id;
    // console.log(userId);
    User.findOne({
        "_id": userId
    }, function(err, user) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            // console.error('Doing /user/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(400).send('Bad userId ' + userId);
            return;
        }
        // console.log('user:', user);
        response.end(JSON.stringify(user));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function(request, response) {
    var userId = request.params.id;
    console.log("/photosOfUser/: ", userId);
    Photo.find({
        "user_id": userId
    }, function(err, photos) {
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            // console.error('Doing /photosOfUser/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (Photo.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(400).send('Missing photo');
            return;
        }
        var photoJS = JSON.parse(JSON.stringify(photos));
        // Array to hold async tasks
        var asyncTasks = [];
        photoJS.forEach(function(photo) {
            if (photo.comments !== undefined) {
                photo.comments.forEach(function(comment) {
                    // console.log(comment);
                    asyncTasks.push(function(callback) {
                        User.findOne({
                            "id": comment.user_id
                        }, function(err, user) {
                            if (err) {
                                // Query returned an error.  We pass it back to the browser with an Internal Service
                                // Error (500) error code.
                                // console.error('Doing user findOne error:', err);
                                callback(err);
                                return;
                            }
                            // console.log("attach user to comment");
                            comment.user = user;
                            callback();
                            return;
                        });
                    });
                });
            }
        });
        // console.log(asyncTasks);
        async.parallel(asyncTasks, function(err) {
            // All tasks are done now
            if (err) {
                return response.status(200).send(JSON.stringify(err));
            }
            // console.log("done Async");
            // console.log("export photos");
            photoJS.forEach(function(photo) {
                photo.comments.forEach(function(comment) {
                    // console.log(comment.user);
                });
            });
            response.end(JSON.stringify(photoJS));
        });
    });
});


app.post("/admin/login", function(req, res) {
    console.log("admin/login");
    console.log(req);

    // console.log(req.login_name);
    // console.log(req.body);
});

app.post("/admin/logout", function(req, res) {
    console.log("admin/logout");
    req.session.destroy();
});

var server = app.listen(3000, function() {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
