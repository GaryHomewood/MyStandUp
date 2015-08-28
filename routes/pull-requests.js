var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
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
            url: process.env.STASH_HOST + '/rest/api/1.0/projects/' + process.env.STASH_PROJECT + '/repos/' + process.env.STASH_REPO + '/pull-requests',
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
                var pullRequestSummary = [];
                for (var pullRequestIndex in results.values) {
                    pullRequestSummary.push({
                        title: results.values[pullRequestIndex].title,
                        author: results.values[pullRequestIndex].author.user.displayName,
                        source: results.values[pullRequestIndex].fromRef.displayId,
                        href:  results.values[pullRequestIndex].links.self[0].href
                    });
                }

                res.render('pull-requests', {
                    title: 'MyStandUp' ,
                    pullRequests: pullRequestSummary});
            }
        );
    }
});


module.exports = router;
