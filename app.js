/** ==========================================
; Title:  fundstrtr
; Description: Crowdfunding Platform API
; Author: Oyindamola Obaleke
; Date:   1 Apr 2020
;=======================================*/


require('dotenv').config()
var express = require('express')
var bodyParser = require('body-parser'),
    mongoose = require('mongoose')
passport = require('passport'),
    LocalStrategy = require('passport-local')
passportLocalMongoose = require('passport-local-mongoose'),
    fileSystem = require('fs'),
    methodOverride = require('method-override'),
    flash = require('connect-flash');

const fileupload = require('express-fileupload');

//Production Scalegrid
// var certificateFileBuf = fileSystem.readFileSync("sslCA");
// var options = {
//     sslCA: certificateFileBuf
// }

// mongoose.connect(process.env.MongoDbScaleGrid, options)
//     .then(() => {
//         console.log("Connected to MongoDbScaleGrid")
//     }).catch(function(err) {
//         console.log("Error" + err)
//     })



// Production
mongoose.connect(process.env.MongoDBAtlas, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDbAtlas")
}).catch(function(err) {
    console.log("Error" + err)
})

//Development
//mongoose.connect('mongodb://localhost/fundstrtr_1_app', { useNewUrlParser: true, useUnifiedTopology: true });

var app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method")) //whenever app gets a request having _method use that new request to override 
app.set("view engine", "ejs");
app.use(fileupload({ useTempFiles: true }));


//ROUTES DECLARATION -- ENDPOINTS
var homeEndPoint = require('./Web Api/end points/Home endpoint/homeEndPoint')
var investmentOppEndPoint = require('./Web Api/end points/investmentOppEndPoints/invOppEndPoint')
let commentsEndPoint = require('./Web Api/end points/commentsEndpoints/commentsEndPoint')
let authenticationEndPoint = require('./Web Api/end points/authEndpoints/authenticationController')
let usersEndPoint = require('./Web Api/end points/userProfileEndPoint/userProfileEndPoint')
let connectionTokenEndPoint = require('./Web Api/end points/connectionTokenEndpoint/mobileConnectionEndpoint');

//MODELS
var invOpp = require('./Web Api/models/investmentopportunities')
var discussion = require('./Web Api/models/discussion')
var User = require('./Web Api/models/user')

//FLASH MESSAGE 
app.use(flash());

//PASSPORT CONFIG
app.use(require('express-session')({ //requiring the package and passing in some options
    secret: "ezffst", //used to encode and decode the sessions 
    resave: false,
    saveUninitialized: false
}))

//set passport up for use
app.use(passport.initialize())
app.use(passport.session())

//--Responsible for reading the session & taking the data thats encoded in session and unencoding it

// encoding the data and put back in session
passport.serializeUser(User.serializeUser());
//unencoding the data
passport.deserializeUser(User.deserializeUser())

//passport.use(new LocalStrategy(User.authenticate())) //uses default passport config, username & password
passport.use(User.createStrategy())

//Middleware- passing currentUser and Flash messages to every route
app.use(function(req, res, next) {
    res.locals.currentUser = req.user

    // res.locals.successMessage = req.flash('success_message');
    // res.locals.errorMessage = req.flash('error_message');
    next();
})



//ROUTES-- endpoints
app.use(homeEndPoint)
app.use(investmentOppEndPoint)
app.use(commentsEndPoint)
app.use(authenticationEndPoint)
app.use(usersEndPoint);
app.use(connectionTokenEndPoint);



//HANDLE 404 REQUEST- NEED TO FINISH
// app.use(function(req, res) {
//     //render error page
//     res.status(404).render('404');
// });


//Middlewares
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // the next thing to run
    } else {
        req.flash('error_message', "You need to Login!")
        console.log("You are not logged in")
        res.redirect("/") //should be redirecting to /login(but its a modal) showing modal login
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

//Production -only runs on port 3000 on servers-  .process.env.PORT, process.env.IP,
// app.listen(3000, function() {
//     console.log("Fundstrtr listening on port 3000")
// })

//Development
app.listen("3002", function() {
    console.log("Fundstrtr listening on port 3002")
})