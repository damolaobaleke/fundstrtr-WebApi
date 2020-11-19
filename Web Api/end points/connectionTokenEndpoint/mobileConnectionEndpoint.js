const express = require('express');
const router = express.Router();

// Response
const { successResponseMsg, errorResponseMsg } = require('../../utils/responses');


//STRIPE
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Creating a connectionToken need by the SDK
let connectionToken = stripe.terminal.connectionTokens.create();

router.get('/connection_token', async (req, res) => {
 try{
    const token = await connectionToken;
    return successResponseMsg(res, 201, 'Connection token created', {secret: token.secret});
 } catch (err) {
    return errorResponseMsg(res, 500, err.message);
 }
});

module.exports = router;
