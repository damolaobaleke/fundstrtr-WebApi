var express = require('express')
var router = express.Router()

let authMiddleware = require('../../middleware/auth');


//Show routes to all endpoints
router.get("/", function(req, res) {
    res.send({
        pitches_url: "https://api.fundstrtr.com/investopp",
        users_url: "https://api.fundstrtr.com/users",
        current_user_url: "https://api.fundstrtr.com/users/:id",
        pitch_comments_url: "https://api.fundstrtr.com/investopp/pitch/:id/discussion",
        pitch_create_comment_url: "https://api.fundstrtr.com/investopp/pitch/:id/discussion/create",
        pitch_update_comment_url: "https://api.fundstrtr.com/investopp/pitch/:id/details/comments/:comment_id/",
        user_url_update: "https://api.fundstrtr.com/my-profile/complete-form/:id",
        user_url_portfolio: "https://api.fundstrtr.com/my-profile/:id/portfolio"
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