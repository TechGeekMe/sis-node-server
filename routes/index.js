var scrapeTool = require('../helpers/scrape_tool.js');
var mongoose = require('mongoose');
var Student = mongoose.model('Student');
module.exports = function(app)  {
    app.get('/', function(req, res, next) {
        res.end("SIS Proxy server")
    })
    app.get('/api/login', function(req, res, next) {
        var usn = req.query.usn;
        var dob = req.query.dob;
        console.log("USN" + usn + "DOB" + dob);
        Student.exists(usn, function(err, exists) {
            if (err) {
                console.log(err);
                return;
            }
            if (exists) {
                // Change it to one doc only
                Student.find({usn: usn}, function(err, docs) {
                    res.end(JSON.stringify(docs));
                })
            }
        })
        scrapeTool(usn, dob, function(error, student) {
            if (error) {
                console.log(error)
                return;
            }
            Student.updateStudent(student, function(err, numAffected) {
                console.log("Student inserted");
            });
            res.end(JSON.stringify(student));
        })
    })
}
