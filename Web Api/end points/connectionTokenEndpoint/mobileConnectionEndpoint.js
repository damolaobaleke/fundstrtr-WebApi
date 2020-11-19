const express = require('express');
const router = express.Router();

//model
const User = require('../../models/user')

// Response
const { successResponseMsg, errorResponseMsg } = require('../../utils/responses');


//STRIPE
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Creating a connectionToken need by the SDK

router.get('/connection_token', async(req, res) => {
    try {
        const token = await stripe.terminal.connectionTokens.create();

        return successResponseMsg(res, 201, 'Connection token created', { secret: token.secret });
    } catch (err) {
        return errorResponseMsg(res, 500, err.message);
    }
});

router.get('/user/:id/ephemeralKey', async(req, res) => {
    User.findById(req.params.id, async function(err, user) {
        if (!err) {
            console.log(user)

            let key = await stripe.ephemeralKeys.create({ customer: user.stripeCustomerId }, { apiVersion: '2020-08-27' });
            return successResponseMsg(res, 200, 'user ephemeral key gotten', key)
        } else {
            return errorResponseMsg(res, 400, 'No ephemeral key found', null)
        }
    })
})

module.exports = router;