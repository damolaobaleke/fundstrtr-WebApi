var mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var userSchema = mongoose.Schema({
    email: String,
    username: String,
    password: String,
    isInvested: { type: Boolean, default: false }
})

//Adds methods which comes with the passportLocalMongoose package to the userSchema
//use email field for auth
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

var User = mongoose.model("user", userSchema)
module.exports = User