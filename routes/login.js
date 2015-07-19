var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/', function(req, res, next) {
    console.log(req.body.username);

    var username = req.body.username;
    var password = req.body.password;
    var session = req.session;

    if (username && password) {
        // store details
        req.session.username = username;
        req.session.password = password;

        if (req.body.remember) {
            res.cookie('user', { username: username, password: password }, { maxAge: 900000 });
        }
        res.redirect('/');
    }
});


module.exports = router;
