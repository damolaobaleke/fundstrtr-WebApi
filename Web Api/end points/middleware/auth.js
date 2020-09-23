//Middlewares
module.exports = {
    isLoggedInd: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next() // the next thing to run
        } else {
            res.send({ "message": "Requires Authentication", docs: "https://api.fundstrtr.com" });
        }
    },
    
    isNotRegisteredd: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next() // the next thing to run
        } else {
            req.flash('error_message', "You need to register!")
            res.redirect("/signup") //should also be login
        }
    },
    
    validationd: (req, res, next) => {
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
}