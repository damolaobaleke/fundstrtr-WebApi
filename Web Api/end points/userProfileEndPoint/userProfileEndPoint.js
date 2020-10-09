const express = require('express');
const mongoose = require('mongoose')
const moment = require('moment') //format date library
mongoose.set('useFindAndModify', false);

const { errorResponseMsg, successResponseMsg } = require('../../utils/responses');
const uploadPhoto = require('../../utils/cloudinary-Config/cloudinaryConfig'); //upload cloudinary config

let router = express.Router()

//Model
var User = require('../../models/user');

//GET profile
router.get('/my-profile/:id', function(req, res) {
    User.findById(req.params.id, function(err, userInDb) {
        if (err) {
            return errorResponseMsg(res, 400, "error", null)
        } else {
            //HTML date type input doesnt support ISO format
            const formatDate = moment(userInDb.dateOfBirth).format("YYYY-MM-DD");
            return successResponseMsg(res, 200, 'User profile found', { userInDb, dateOfBirth: formatDate })
        }
    })
})

//Update(PUT) profile
router.put('/my-profile/complete-form/:id', function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.user, (err, updatedUserInDb) => { //req.body.user-- user object already logged in req
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

//GET Portfolio
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