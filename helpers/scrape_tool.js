var request = require('request'),
    cheerio = require('cheerio'),
    promise = require('promise'),
    url = "http://parents.msrit.edu/index.php";
    AuthError = require('../AuthError');

module.exports = function(usn, dob, callback) {
    updatingList.push(usn)
    var j = request.jar();
    request({url: url, jar: j}, function(error, response, body) {
        if (error) {
            callback(error, null);
            return;
        }
        var $ = cheerio.load(body);
        var magicInput = $('input').last().attr('name');
        var encodedDob = "";
        for (var i = 0; i < dob.length; i++) {
            encodedDob += dob.charAt(i) + "  ";
        }
        var dobBase64 = new Buffer(encodedDob).toString('base64');
        var payload = {'username': usn, 'passwd': dobBase64, "option": "com_user", "task": "login"};
        payload[magicInput] = "1";
        var student = {};
        request.post({url: url, jar: j, form: payload, followAllRedirects: true}, function(error, response, body) {
            if (error) {
                callback(error);
                return;
            }
            // console.log(body)
            var $ = cheerio.load(body);
            // TODO: Check if name is null, return student not found
            student.name = $('.tname2').first().text().trim();
            student.usn = usn.toUpperCase();
            student.dob = dob;
            student.courses = [];
            var courses = $('.dash_od_row, .dash_even_row').map(function(i, el) {
                return $(el);
            }).get();
            console.log(student);
            if (courses.length == 0) {
                callback(new AuthError('Student not found'), null);
                return;
            }
            var coursePromises = [];
            courses.forEach(function(course) {
                coursePromises.push(fetchCourse(course, j));
            })
            Promise.all(coursePromises).then(function(values) {
                values.forEach(function(course) {
                    student.courses.push(course);
                });
                student.update = Date.now()
                callback(null, student)
            })
            .catch(function(reason) {
                console.log(reason);
            })
        })
    })
}

function prependUrl(url) {
    return 'http://parents.msrit.edu/' + url;
}

function fetchCourse(elem, j) {
    var p = new Promise(function(resolve, reject) {
        var course = {};
        course.code = elem.find('.courseCode').text();
        course.name = elem.find('.coursename').text();
        var attendance_element = elem.find('.att').children().first();
        course.attendance = {}
        var percentage = attendance_element.text();
        percentage = percentage.substring(0, percentage.length-1)
        course.attendance.percentage = percentage;
        var cie_element = elem.find('.cie').children().first();
        course.cie = cie_element.text();
        course.assignments = [];
        course.tests = [];
        var cie_link = prependUrl(cie_element.attr('href'));
        var cie_promise = new Promise(function(resolve, reject) {
            request.post({url: cie_link, jar: j}, function(error, response, body) {
                function getTableCell(row, n) {
                    return row.children().get(n).children[0].data.trim();
                }
                var $ = cheerio.load(body);
                var row = $('.odd');
                 for (var i = 0; i <= 3; i++) {
                    var marks = getTableCell(row, i);
                    if (marks !== '-') {
                        if (marks == 'Abscent') {
                            marks = 'A';
                        }
                        var marksVal = marks.split("/")[0]
                        course.tests.push(marksVal);
                    }
                }
                for (var i = 4; i <= 6; i++) {
                    var marks = getTableCell(row, i);
                    if (marks !== '-') {
                        if (marks == 'Abscent') {
                            marks = 'A';
                        }
                        var marksVal = marks.split("/")[0]
                        course.assignments.push(marksVal);
                    }
                }
                resolve('done');
            })
        });

        var attendance_link = prependUrl(attendance_element.attr('href'));
        var attendance_promise = new Promise(function(resolve, reject) {
            request.post({url: attendance_link, jar: j}, function(error, response, body) {
                var $ = cheerio.load(body);
                course.attendance.attended = $('.progress').children().get(0).children[0].data.trim();
                course.attendance.absent = $('.progress').children().get(1).children[0].data.trim();
                if (course.attendance.absent == '') {
                    course.attendance.absent = '0';
                }
                if ($('.progress').children().get(2)) {
                    course.attendance.remaining = $('.progress').children().get(2).children[0].children[0].data.trim();
                }  else {
                    course.attendance.remaining = '0';
                }
                resolve('done');
            });
        });
        Promise.all([cie_promise, attendance_promise]).then(function(values) {
            resolve(course);
        })
        .catch(function(reason) {
            console.log(reason);
        })
    })
    return p;
}
