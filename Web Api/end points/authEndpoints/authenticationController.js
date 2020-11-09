const router = require('express').Router();
const sgMail = require('@sendgrid/mail');
const { signJWT } = require('../../utils/security/auth-token');

const { successResponseMsg, errorResponseMsg, sessionSuccessResponseMsg } = require('../../utils/responses');
const emailTemplate = require('../../utils/email-templates/signup-template');

//Models
const User = require('../../models/user')

//AUTHENTICATION ROUTES
router.post("/signup", function(req, res) {
    const newUsers = new User({ email: req.body.email, username: req.body.username });

    User.register(newUsers, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
            return errorResponseMsg(res, 400, err.message, null);
        } else {
            passport.authenticate("local", { session: false })(req, res, function() {
                //Send notification
                const email = emailTemplate(user.username);

                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const msg = {
                    to: user.email,
                    from: 'info@eazifunds.com',
                    subject: 'Welcome to Fundstrtr',
                    text: email.emailText,
                    html: email.emailHtml,
                };

                sgMail.send(msg)
                    .then(function() {
                        console.log('Message sent succcessfully');
                    }).catch(error => {
                        console.log(error);
                    });

                //Sign email and username with json web token
                const token = signJWT({
                    email: user.email,
                    username: user.username
                });
                return sessionSuccessResponseMsg(res, 201, 'Registered user successfully', token, user);
            });
        }
    });
});



//LogIn
router.post("/login", passport.authenticate('local', { session: false }), (req, res) => {
    //No user in the request
    if (!req.user) {
        return errorResponseMsg(res, 400, 'Invalid email or password');
    }
    const token = signJWT({
        _id: req.user._id,
        email: req.user.email,
        username: req.user.username
    });
    console.log(res.user);
    return sessionSuccessResponseMsg(res, 200, 'Login successfull', token, req.user);
})


// Update user profile

//LogOut
router.get("/logout", function(req, res) {
    req.logOut() //destroying user data in the session from request
    return successResponseMsg(res, 200, 'Logout successfully')
})

//sign up with google
//sign up with facebook
//sign up with LinkedIn

//AUTHENTICATION ROUTES

module.exports = router