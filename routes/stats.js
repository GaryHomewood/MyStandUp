var express = require('express');
var moment = require('moment');
var router = express.Router();

/* GET users listing. */
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
                    var issue = results.issues[issueIndex].fields;
                    resolutionDate = moment(issue.resolutiondate);
                    firstResolutionDate = resolutionDate.clone().startOf('day');
                }

                // initialise the statistics hashmap for all dates since the first issue resolved
                // to today, in reverse chronological order
                var resolutionStats = {};
                resolutionDate = firstResolutionDate;
                var statsDate = new Date(moment().clone().startOf('day'));
                // get rid of BST
                statsDate = moment(statsDate).add(0, "days");
                while (!moment(statsDate).isBefore(resolutionDate)) {
                    resolutionStats[statsDate] = {count: 0};
                    statsDate = moment(statsDate).add(-1, "days");
                }

                // update the statistics counts
                for (var issueIndex in results.issues) {
                    var resolutionDate = moment(results.issues[issueIndex].fields.resolutiondate);
                    resolutionStats[resolutionDate.clone().startOf('day')].count++;
                }

                // convert statistics from hashmap to array
                var resolutionStatsSummary = [];
                for (var date in resolutionStats) {
                    resolutionStatsSummary.push({
            		                 date: moment(date).format("ddd Do MMM"),
                                     count: resolutionStats[date].count
            	                    });
                }

                res.render('stats', {
                    title: 'MyStandUp' ,
                    stats: resolutionStatsSummary});
            }
        );
    }
});

module.exports = router;
