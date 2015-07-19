var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    req.session.destroy();
    res.clearCookie('user');
    res.render('logout', { title: 'Login' });
});

module.exports = router;
