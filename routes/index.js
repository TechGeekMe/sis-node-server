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
                Student.findOne({usn: usn}, function(err, doc) {
                    res.end(JSON.stringify(doc));
                })
            } else {
                scrapeTool(usn, dob, function(error, student) {
                    if (error) {
                        res.end();
                        console.log(error)
                        return;
                    }
                    Student.insertStudent(student, function(err, doc) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log("Student inserted");
                        res.end(JSON.stringify(doc));
                    });
                })
            }
        })
    })
}
