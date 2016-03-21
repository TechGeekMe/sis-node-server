var mongoose = require('mongoose');
var express = require('express');
require('express-mongoose');
var models = require('./models/student.js')
var routes = require('./routes');
global.updatingList = new Array()
mongoose.connect('mongodb://sis:***REMOVED***@***REMOVED***', function(err) {
    if (err) throw err;
    console.log("Connected!")

    var app = express();
    routes(app);

    app.listen(3000, function() {
        console.log("Listening on port 3000");
    });
})
