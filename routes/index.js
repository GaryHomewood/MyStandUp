var express = require('express');
var moment = require('moment');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var jql = "project+in+(" + process.env.JIRA_PROJECTS + ")+" +
            "AND+issuetype+in+(Bug,Story,Task)+" +
            "AND+status+was+Resolved+by+garhom+" +
            "AND+resolutiondate!=null+" +
            "ORDER+BY+resolutiondate&fields=key,summary,description,updated,priority,resolutiondate,project";

    if (!req.session.username) {
        res.redirect('/login');
    } else {
        var u;
        var p;

        if (req.cookies.user) {
            u = req.cookies.user.username;
            p = req.cookies.user.password;
        } else {
            u = req.session.username;
            p = req.session.password;
        }

        var request = require('request');
        var options = {
            url: process.env.JIRA_HOST + '/rest/api/latest/search?jql=' + jql,
            auth : {
                user: u,
                pass: p
            }
        };

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

                    // take account of weekends
                    var resolved = false;
                    if (    (now.day() == 1 && daysAgo == 3)
                        ||  (now.day() == 7 && daysAgo == 2)
                        ||  (daysAgo <= 1)) {
                        resolved = true
                    }

                    var desc = results.issues[issueIndex].fields.description;
                    if (desc != null) {
                        desc = desc.replace(/[\n\r]/g, '');
                    }

                    resultsSummary.push({
                        key: results.issues[issueIndex].key,
                        summary: results.issues[issueIndex].fields.summary,
                        description: desc,
                        priority: results.issues[issueIndex].fields.priority.name,
                        resolutionDate: results.issues[issueIndex].fields.resolutiondate,
                        timeAgo: timeAgo,
                        daysAgo: daysAgo,
                        resolved: resolved,
                        url: process.env.JIRA_HOST + "/browse/" + results.issues[issueIndex].key
                    });
                }

                res.render('index', {
                    title: 'MyStandUp' ,
                    username: req.session.username,
                    results: resultsSummary});
            }
        );
    }
});

module.exports = router;
