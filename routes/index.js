var express = require('express');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        var request = require('request');
        var options = {
            url: process.env.JIRA_HOST + '/rest/api/latest/search?jql=project+in+(' + process.env.JIRA_PROJECTS + ')+AND+issuetype+in+(Bug)+and+status+was+Resolved+by+garhom+ORDER+BY+resolutiondate&fields=key,summary,description,updated,priority,resolutiondate',
            auth : {
                user: req.session.username,
                pass: req.session.password
            }
        };

        console.log(options);

        var request = request(
            options,
            function (error, response, body) {
                response.setEncoding('utf8');
                results = JSON.parse(body);
                var resultsSummary = [];
                var now = moment();

                for (var issueIndex in results.issues) {
                    var resolutionDate = moment(results.issues[issueIndex].fields.resolutiondate);
                    var timeAgo = moment.duration(now.diff(resolutionDate)).humanize();
                    var daysAgo = 0;
                    if (now.dayOfYear() < resolutionDate.dayOfYear()) {
                        daysAgo = (365 - resolutionDate.dayOfYear()) + now.dayOfYear();
                    } else {
                        daysAgo = now.dayOfYear() - resolutionDate.dayOfYear();
                    }

                    resultsSummary.push({
                        key: results.issues[issueIndex].key,
                        summary: results.issues[issueIndex].fields.summary,
                        description: results.issues[issueIndex].fields.description.replace(/[\n\r]/g, ''),
                        priority: results.issues[issueIndex].fields.priority.name,
                        resolutionDate: results.issues[issueIndex].fields.resolutiondate,
                        timeAgo: timeAgo,
                        daysAgo: daysAgo
                    });
                }

                console.log(resultsSummary);

                res.render('index', {
                    title: 'MyStandUp' ,
                    username: req.session.username,
                    results: resultsSummary});
            }
        );
    }
});

module.exports = router;
