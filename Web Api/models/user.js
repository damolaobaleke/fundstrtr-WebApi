const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    gender: [{ type: String }],
    addressLine1: String,
    addressLine2: String,
    city: String,
    postcode: String,
    country: [{ type: String }],
    phoneNumber: String,
    profileImage: String,
    dateOfBirth: Date,
    /*auth*/
    linkedinId: String,
    facebookId: String,
    googleId: String,
    //Association by reference to pitches
    pitchesInvestedIn: [{
        type: mongoose.Types.ObjectId,
        ref: "investmentOpportunity",
    }],
    netWorth: Number,
    emailToken: String,
    investments: [{ type: Number }],
    emailMarketing: { type: Boolean, default: false },
    isInvested: { type: Boolean, default: false },
    datesOfInvestments: [{ type: Date }],
    dateJoined: { type: Date, default: Date.now }
})

//Adds methods which comes with the passportLocalMongoose package to the userSchema e.g Register()
//use email field for auth
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

const User = mongoose.model("user", userSchema)

module.exports = User