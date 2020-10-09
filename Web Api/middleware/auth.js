//Middlewares
let middleWareObj = {}

middleWareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // the next thing to run
    } else {
        res.send({ "message": "Requires Authentication", docs: "https://api.fundstrtr.com/v1" });
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


module.exports = middleWareObj;