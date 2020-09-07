var express = require('express')
var router = express.Router()

var invOpp = require('../../models/investmentopportunities')

//About Us Route
router.get("/about", function(req, res) {
    res.render("AboutUs/Aboutus")
})

//Investing Info
router.get("/investing", function(req, res) {
    invOpp.find({}, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("InvestingInfo/InvestingInfo", { data: pitchInDb })
        }
    })
})

module.exports = router