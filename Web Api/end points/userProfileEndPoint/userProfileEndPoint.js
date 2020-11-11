const express = require('express');
const mongoose = require('mongoose')
const moment = require('moment') //format date library
mongoose.set('useFindAndModify', false);

const { errorResponseMsg, successResponseMsg } = require('../../utils/responses');
const uploadPhoto = require('../../utils/cloudinary-Config/cloudinaryConfig'); //upload cloudinary config

let router = express.Router()

//Model
var User = require('../../models/user');

//ENDPOINT -GET ALL USERS
router.get("/users", function(req, res) {
    User.find({}, function(err, userInDb) {
        if (err) {
            console.log(err)
        } else {
            return successResponseMsg(res, 200, 'Fetched all users', userInDb);
        }
    })
})


//ENDPOINT -GET USER (GET profile)
router.get('/users/:id', function(req, res) {
    User.findById(req.params.id, function(err, userInDb) {
        if (err) {
            console.log(err)
            return errorResponseMsg(res, 404, 'User not found');
        } else {
            //HTML date type input doesnt support ISO format
            const dobFormatted = moment(userInDb.dateOfBirth).format("YYYY-MM-DD");
            userInDb.dateOfBirth = dobFormatted;
            userInDb.save();

            return successResponseMsg(res, 200, 'User profile found', userInDb)
        }
    })
})

//Update(PUT) profile
router.put('/my-profile/complete-form/:id', function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, (err, updatedUserInDb) => { //req.body-- user object already logged in req
        if (err) {
            return errorResponseMsg(res, 400, "error", null)
        } else {
            return successResponseMsg(res, 200, 'User profile updated', updatedUserInDb)
        }
    })
})

//POST- Upload profile Photo --Clouindary sdk/Api for the mobile would be implemented
router.post('/my-profile/:id/upload', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const photo = await uploadPhoto(req, res, 'image/png', 'image/jpeg', 20000); //max size 20000kb == 20Mb
        user.profileImage = photo;
        await user.save(function(err, updatedUserInDb) {
            if (err) {
                return errorResponseMsg(res, 400, "error", null)
            } else {
                return successResponseMsg(res, 200, 'Profile photo added', updatedUserInDb.profileImage)
            }
        });

        //Return success
        return res.status(200).json({
            status: "success"
        })

    } catch (err) {
        console.log(err)
    }
});

//GET Portfolio--Add loggedIn middleware
router.get("/my-profile/:id/portfolio", function(req, res) {
    //path == key in model of what is to be populated
    User.findById(req.params.id).populate({ path: 'pitchesInvestedIn', populate: { path: 'investor', model: 'User' } }).exec(function(err, userInDb) {
        if (err) {
            return errorResponseMsg(res, 400, "error", null)
        } else {
            return successResponseMsg(res, 200, 'User portfolio found', userInDb)
        }
    })
})

module.exports = router;