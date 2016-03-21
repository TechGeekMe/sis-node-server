var scrapeTool = require('../helpers/scrape_tool.js');
var mongoose = require('mongoose');
var Student = mongoose.model('Student');
var AuthError = require('../AuthError');
module.exports = function(app)  {
    app.get('/', function(req, res, next) {
        res.end("SIS Proxy server")
    })
    app.get('/api/login', function(req, res, next) {
        var usn = req.query.usn.toUpperCase();
        var dob = req.query.dob;
        console.log("USN" + usn + "DOB" + dob);
        console.log("updatingList: " + updatingList)
        Student.exists(usn, function(err, exists) {
            if (err) {
                console.log(err);
                return;
            }
            if (exists) {
                Student.findOne({usn: usn}, function(err, doc) {
                    if(doc.dob == dob){
                        res.end(JSON.stringify(doc));
                        if(updatingList.indexOf(usn) == -1){
                            scrapeTool(usn, dob, function(error, student) {
                                updatingList.splice(updatingList.indexOf(usn),1)
                                if (error) {
                                    console.log(error)
                                    return;
                                }
                                Student.updateStudent(student, function(err, numAffected) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    }
                                    console.log(numAffected + "Student updated");
                                });
                            })
                        }else{
                            console.log("Already Updating: " + usn)
                        }
                    }else{
                        res.status(401);
                        res.end("Credential Mismatch")
                    }
                })
            } else {
                scrapeTool(usn, dob, function(error, student) {
                    updatingList.splice(updatingList.indexOf(usn),1)
                    if (error) {
                        console.log(error)
                        if (error instanceof AuthError) {
                            res.status(401);
                        }
                        res.end();
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
