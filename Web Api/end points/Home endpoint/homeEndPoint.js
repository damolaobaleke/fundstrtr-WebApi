var express = require('express')
var router = express.Router()

let authMiddleware = require('../../middleware/auth');


//Show routes to all endpoints
router.get("/", function(req, res) {
    res.send({
        pitches_url: "https://api.fundstrtr.com/investopp",
        users_url: "https://api.fundstrtr.com/users",
        current_user_url: "https://api.fundstrtr.com/users/:id"
    });

    //Some bug with page rendering -- --Require auth before access

    //res.render('Auth/authentication');
})

router.get("/endpoints", function(req, res) {
    res.send({
        pitches_url: "https://api.fundstrtr.com/investopp",
        users_url: "https://api.fundstrtr.com/users",
        current_user_url: "https://api.fundstrtr.com/users/:id"
    });
})


module.exports = router;