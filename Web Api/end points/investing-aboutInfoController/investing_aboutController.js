const express = require('express')
const router = express.Router()
const { successResponseMsg } = require('../../utils/response');
const invOpp = require('../../models/investmentopportunities')

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
            return successResponseMsg(res, 200, 'Fetched investing info', pitchInDb);
        }
    })
})

module.exports = router