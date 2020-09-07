var express = require('express');
const sgMail = require('@sendgrid/mail');
var router = express.Router()


//Models
var User = require('../../models/user')

//AUTHENTICATION ROUTES

//SignUp
router.get("/signup", function(req, res) {
    res.render("Authentication/signUp")
})

router.post("/signup", function(req, res) {
    var Users = new User({ email: req.body.email, username: req.body.username });

    User.register(Users, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
            req.flash("error_message", "Error: " + err)
            return res.render("Authentication/signUp")
        } else {
            passport.authenticate("local")(req, res, function() {
                console.log(user)
                req.flash("success_message", "Registered Successfully !")

                //Send notification

                //Email Notification text --Add Verification link with token
                var emailText = ` <div class="bg-notify">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
                            <p>Hello, welcome to fundstrtr
                            ${user.username} ,your to go crowdfunding application where you can invest in businesses at any stage.</p>
        
                            <p class="bg-light" style="background: E5E5E5; color: #283990">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum adipisci in, neque fuga repellat ex accusantium. Ipsam blanditiis, eaque, reprehenderit totam, architecto doloribus vel eveniet repellendus dignissimos placeat omnis voluptatum.
                            </p>
                        </div>
                    </div>
                </div>
            </div>`
                var emailHtml = `<h1>Welcome ${user.username}</h1> <br> ` + emailText

                //change to env variable - more security(prevent impersonation)
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const msg = {
                    to: user.email,
                    from: 'info@eazifunds.com',
                    subject: 'Welcome to Fundstrtr',
                    text: emailText, //shows in email notification before opening
                    html: emailHtml,
                };
                sgMail.send(msg)
                    .then(function() {
                        req.flash("success_message", "You should receive an email notification")
                    }).catch(error => {
                        console.log(error)
                    })

                res.redirect('/investopp')
            })
        }
    })
})



//LogIn
router.post("/login", passport.authenticate('local', { successRedirect: "/investopp", failureRedirect: "/signup " }), function(req, res) {

})

//ENDPOINT -- Require auth ??
router.get("/users", function(req, res) {
    User.find({}, function(err, userInDb) {
        if (err) {
            console.log(err)
        } else {
            res.send({ "Users": userInDb });
        }
    })
})

router.get("/users", function(req, res) {
    User.findById(req.params.id, function(err, userInDb) {
        if (err) {
            console.log(err)
        } else {
            res.send({ "Users": userInDb });
        }
    })
})

//LogOut
router.get("/logout", function(req, res) {
    req.logOut() //destroying user data in the session from request
    req.flash("success_message", "Logged Out !")
    res.redirect("/")
})

//sign up with google
//sign up with facebook
//sign up with LinkedIn

//AUTHENTICATION ROUTES



//Middlewares
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // the next thing to run
    } else {
        res.send({ "message": "Requires Authentication", docs: "https://api.fundstrtr.com" });
    }
}

function isNotRegistered(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // the next thing to run
    } else {
        req.flash('error_message', "You need to register!")
        res.redirect("/signup") //should also be login
    }
}

function validation(req, res, next) {
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

module.exports = router