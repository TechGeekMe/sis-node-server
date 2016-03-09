var mongoose = require('mongoose');

//defining the schema of the DB
var SisSchema = mongoose.Schema({
    usn: String,
    name: String,
    courses: [{
        _id: false,
        code: String,
        name: String,
        attendance: {
            _id: false,
            percentage: Number,
            attended: Number,
            absent: Number,
            remaining: Number
        },
        cie: String,
        tests: [Number],
        assignments: [Number]
    }],
    updated: {type: Date, default: Date.now, trim: true}
});

//creating a model

SisSchema.statics.exists = function(usn, callback) {
    this.model('Student').count({usn: usn}, function (err, count) {
        if(err) {
            console.log("Student Count error")
            callback(err, null)
            return;
        }
        if(count > 0)  {
            callback(null, true);
        }else {
            callback(null, false);
        }
    } );
}
SisSchema.statics.insertStudent = function(student, callback)  {
    //var student = mongoose.models('student', SisSchema);
    var student = new this(student);
    student.save(function(err, doc) {
        if(err) {
            console.log("error inserting student");
            callback(err, doc);
        } else {
            console.log("New student inserted into DB");
            callback(null, doc);
        }
    });
 }
SisSchema.statics.updateStudent = function(student, callback) {
    var usn = student.usn;
    var query = {usn: usn}
    this.update(query, student, function(err, numAffected)  {
        if(err) {
            console.log("Error Updating student in DB");
            callback(err, null)
        }else {
            console.log("Student updated in db");
            callback(null, numAffected)
        }
    });
}

module.exports = mongoose.model('Student', SisSchema);
