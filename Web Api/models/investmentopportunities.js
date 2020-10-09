const mongoose = require('mongoose')

const InvestmentOpp = mongoose.Schema({
    email: { type: String, default: "femi@gmail.com" },
    firstname: String,
    lastname: String,
    phoneNumber: Number,
    companyCountry: [{
        type: String
    }],
    businessType: [{
        type: String
    }],
    corporateStructure: [{
        type: String
    }],
    raisingAmount: { type: String, default: 40000 },
    raisingType: String,
    companyNumber: String,
    RegisteredCompanyName: String,
    tradingName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    companyWebsite: { type: String, default: 'https://www.eazifunds.com' },
    facebookUrl: { type: String, default: 'https://web.facebook.com/Eazi-Funds-Inc-511497816039463/' },
    twitterUrl: { type: String, default: 'https://twitter.com/eazifundsinc_' },
    instagramUrl: { type: String, default: 'https://www.instagram.com/eazifundsinc/' },
    linkedinUrl: { type: String, default: 'https://www.linkedin.com/company/eazifunds' },
    companyLogo: String,
    // companyheader:{data: Buffer, contentType: String},
    executiveSummary: String,
    milestone: String,
    //milestone2: String,
    //milestone3: String,
    //milestone4: String,
    equityOffer: String,
    premoneyValuation: Number,
    sharePrice: { type: Number },
    idea: String,
    //Team
    teamMember1: {
        name: String,
        position: String,
        details: String,
        //picture: { data: Buffer, contentType: String }
    },
    teamMember2: {
        name: String,
        position: String,
        details: String,
        //picture: { data: Buffer, contentType: String }
    },
    teamMember3: {
        name: String,
        position: String,
        details: String,
        //picture: { data: Buffer, contentType: String }
    },
    teamMember4: {
        name: String,
        position: String,
        details: String,
        //picture: { data: Buffer, contentType: String }
    },
    teamMember5: {
        name: String,
        position: String,
        details: String,
        //picture: { data: Buffer, contentType: String }
    },
    //Associating Comments with pitch
    discussion: [{
        type: mongoose.Schema.Types.ObjectId, //object id
        ref: "discussion" //the model name
    }],

    //Amount recieved-- storing in an array
    amountReceived: [{ type: Number }],
    noOfInvestors: Number, //Amount received length, no need
    //Addition of the array of amountReceived
    amountRaised: { type: Number },

    //Associate user with pitch
    investor: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        username: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    daysLeftToInvest: { type: Number },
    dateUserInvested: [{ type: Date }],
    //investment options set by business. changed(from Boolean to [String])
    setInvestmentOptions: [{ type: String, default: "nominee_directInvestment" }],
    created: { type: Date, default: Date.now }

})

const invOpp = mongoose.model('investmentOpportunity', InvestmentOpp)
module.exports = invOpp

// Team: [{
//     name: { type: String },
//     position: { type: String },
//     details: { type: String },
//     //picture: { data: Buffer, contentType: String }
// }],

//FIXED TEAM(use in update)--TO STORE ALL MEMBER OBJECTS IN AN ARRAY, WHILE STORING ALL ATTRIBUTES IN AN ARRAY
// Team: [{
//     member1:[{
//         name: { type: String },
//         position: { type: String },
//         details: { type: String },
//     }],
//     member2:[{
//         name: { type: String },
//         position: { type: String },
//         details: { type: String },
//     }],
//     member2:[{
//         name: { type: String },
//         position: { type: String },
//         details: { type: String },
//     }], 
// }],

// investmentOptions:[{
//     nominee:{type: Boolean, default: true},
//     directInvestment:{type:Boolean, default: true}
// }],