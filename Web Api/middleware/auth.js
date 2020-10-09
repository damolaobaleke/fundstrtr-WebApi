const { verifyJWT } = require('../utils/security/auth-token');
const { errorResponseMsg } = require('../utils/responses');
const User = require('../models/user');
const invOpp = require('../models/investmentopportunities')
const discussion = require('../models/discussion')

//Middlewares
let middleWareObj = {}

middleWareObj.isLoggedIn = async function(req, res, next) {
    try {
        const token = req.header('x-auth-token');
        if (!token) return errorResponseMsg(res, 401, 'Unauthorized user. Logging and try again');
        const decoded = await verifyJWT(token);
        console.log(decoded);
        const user = await User.findById(decoded._id);
        if (!user) return errorResponseMsg(res, 401, 'User not found');
        req.user = user;
        req.token = token;
        return next();
    } catch (err) {
        return errorResponseMsg(res, 500, err.message);
    }
}

middleWareObj.isNotRegistered = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // the next thing to run
    } else {
        req.flash('error_message', "You need to register!")
        res.redirect("/signup") //should also be login
    }
}

middleWareObj.validation = function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        console.log("Username & Password not given")
        res.redirect("/signup")
        if (req.body.password !== req.body.confirmPassword) {
            console.log("Passwords dont match")
            res.redirect("/signup")
        }
    } else {
        return next();
    }
}

middleWareObj.checkPitchOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        invOpp.findById(req.params.id, function(err, pitchInDb) {
            if (err) {
                console.log(err)
                res.redirect("back")
            } else {
                //does user own pitch
                console.log(pitchInDb.email + " compared to" + req.user.email)
                if (pitchInDb.email === req.user.email) {
                    next()
                } else {
                    res.redirect("back")
                }
            }
        })
    } else {

    }
}

middleWareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        discussion.findById(req.params.comment_id, function(err, commentInDb) {
            if (err) {
                console.log(err)
                res.redirect("back")
            } else {
                //does user own comment
                if (commentInDb.author.id.equals(req.user._id)) {
                    next()
                } else {
                    res.redirect("back")
                }
            }
        })
    } else {

    }
}

module.exports = middleWareObj;