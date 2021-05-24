var express = require('express')
var router = express.Router()

let authMiddleware = require('../../middleware/auth');


//Show routes to all endpoints
router.get("/", function(req, res) {
    res.send({
        pitches_url: "https://apifb.softroniiks.com/investopp",
        current_pitch_url: "https://apifb.softroniiks.com/investopp/pitches/{id}/details",
        pitch_comments_url: "https://apifb.softroniiks.com/investopp/pitch/{id}/discussion",
        pitch_create_comment_url: "https://apifb.softroniiks.com/investopp/pitch/{id}/discussion/create",
        pitch_update_comment_url: "https://apifb.softroniiks.com/investopp/pitch/{id}/details/comments/{comment_id}/",
        users_url: "https://apifb.softroniiks.com/users",
        user_url: "https://apifb.softroniiks.com/users/{id}",
        user_url_update: "https://apifb.softroniiks.com/my-profile/complete-form/{id}",
        user_url_portfolio: "https://apifb.softroniiks.com/my-profile/{id}/portfolio",
        user_url_upload_photo: "https://apifb.softroniiks.com/my-profile/{id}/upload",
        pay_url: "https://apifb.softroniiks.com/investopp/pitches/{id}/invest/{user_id}/pay",
        user_ephemeralKey_url: "https://apifb.softroniiks.com/user/{id}/ephemeralKey",
        sign_up_url: "https://apifb.softroniiks.com/signup",
        log_in_url: "https://apifb.softroniiks.com/login",
        log_out_url: "https://apifb.softroniiks.com/logout"
    });

    //Some bug with page rendering -- --Require auth before access

    //res.render('Auth/authentication');
})

router.get("/endpoints", function(req, res) {
    res.send({
        pitches_url: "https://apifb.softroniiks.com/investopp",
        users_url: "https://apifb.softroniiks.com/users",
        current_user_url: "https://apifb.softroniiks.com/users/:id"
    });
})


module.exports = router;