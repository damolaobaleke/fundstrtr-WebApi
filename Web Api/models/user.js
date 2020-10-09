const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    phoneNumber: {
        type: String,
        default: null,
        minlength: 8,
        maxlength: 20
    },
    username: String,
    password: String,
    isInvested: { type: Boolean, default: false }
}, {
    timestamps: true
})

//Adds methods which comes with the passportLocalMongoose package to the userSchema
//use email field for auth
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

const User = mongoose.model("user", userSchema)
module.exports = User