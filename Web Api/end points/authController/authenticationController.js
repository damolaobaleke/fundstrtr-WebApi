const router = require('express').Router();
const sgMail = require('@sendgrid/mail');
const { signJWT } = require('../../utils/auth-token');
const emailTemplate = require('../../utils/email-templates/signup-template');
const { successResponseMsg, errorResponseMsg, sessionSuccessResponseMsg } = require('../../utils/response');
//Models
const User = require('../../models/user')

//AUTHENTICATION ROUTES
router.post("/signup", function(req, res) {
    const newUsers = new User({ email: req.body.email, username: req.body.username });

    User.register(newUsers, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
            return errorResponseMsg(res, 400, err.message);
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
                    })
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
    const { user } = req;
    if (!user) return errorResponseMsg(res, 400, 'Invalid email or password');
    const token = signJWT({
        email: user.email,
        username: user.username
    });
    return sessionSuccessResponseMsg(res, 200, 'Login successfully', token, user);
})

//ENDPOINT -- Require auth ??
router.get("/users", function(req, res) {
    User.find({}, function(err, userInDb) {
        if (err) {
            console.log(err)
        } else {
            return successResponseMsg(res, 200, 'Fetched all users', userInDb);
        }
    })
})

router.get("/users/:id", (req, res) => {
    const { id } = req.params;
    User.findById(id, (err, user) => {
        if(err) {
            console.log(err);
            return errorResponseMsg(res, 404, 'User not found');
        } else {
            return successResponseMsg(res, 200, 'Fetched User', user);
        }
    })
})

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