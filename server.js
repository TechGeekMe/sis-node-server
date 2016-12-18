var mongoose = require('mongoose');
var express = require('express');
var credentials = require('./credentials')
require('express-mongoose');
var models = require('./models/student.js')
var routes = require('./routes');
global.updatingList = new Array()
mongoose.connect(credentials.mongodb.uri, {user: credentials.mongodb.user, pass: credentials.mongodb.pass}, function(err) {
    if (err) throw err;
    console.log("Connected!")

    var app = express();
    routes(app);

    app.listen(process.env.PORT || 8080, function() {
        console.log("Listening on port 8080");
    });
})
