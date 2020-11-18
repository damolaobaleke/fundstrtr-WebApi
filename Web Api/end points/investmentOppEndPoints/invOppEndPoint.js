const express = require('express')
var router = express.Router();
let moment = require('moment');

const { errorResponseMsg, successResponseMsg } = require('../../utils/responses');
let middleware = require('../../middleware/auth');

//STRIPE
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//SENDGRID
const sgMail = require('@sendgrid/mail');

//Models
var invOpp = require('../../models/investmentopportunities')

//ENDPOINT-  GET pitches
router.get("/investopp", function(req, res) {
    //Add middle ware "middleware.isLoggedIn" once view rendering for auth fixed

    invOpp.find({}, function(err, invOppInDb) {
        if (err) {
            console.log(err)
            return errorResponseMsg(res, 400, err.message);
        } else {
            /**DAYS LEFT TO INVEST */
            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            let currentDay = new Date();
            console.log(currentDay)

            //Live for 60 days, +2 days refund period for investors
            let dateCreated;

            invOppInDb.forEach((pitch) => {
                dateCreated = new Date(moment(pitch.created).format("YYYY-MM-DD")); //
                console.log(dateCreated);
                console.log("*****************");

                let dateCreated62 = new Date(dateCreated); //date + 62days; 60 + 2 days adds 1 extra day instead of 2
                let daysLive = new Date(dateCreated62.setDate(dateCreated.getDate() + 63));
                console.log(daysLive);
                console.log('Day Live till: ' + daysLive)

                //differenceInDays
                let daysLeft = Math.round(Math.abs((daysLive - currentDay) / oneDay)); //starts counting from daycreated == currentDay
                console.log(`Days Left ${daysLeft}`)

                /*Once days left gets to zero set variable to zero, stop calculating difference in days---FIX*/
                if (daysLeft === 0) {
                    daysLeft = 0;
                    console.log(`Days Left ${daysLeft}`)
                }

                pitch.daysLeftToInvest = daysLeft;
                pitch.save();
            });

            /**DAYS LEFT TO INVEST */

            //res.send({"Investment Opportunites": invOppInDb});
            return successResponseMsg(res, 200, 'pitches fetched', invOppInDb);
        }
    })
})


//SHOW-- 
router.get("/investopp/pitches/:id/details", function(req, res) {
    invOpp.findById(req.params.id).populate({ path: 'discussion', populate: { path: 'replies', model: 'reply' } }).exec(function(err, pitchInDb) {
        if (err) {
            return errorResponseMsg(res, 400, err.message, null)
        } else {
            return successResponseMsg(res, 200, 'pitch details', pitchInDb)
        }
    })
})


//PAY ROUTE -- Integration of Stripe SDK for mobile

//Included in the returned PaymentIntent is a client secret, which is used on the client side to 
//securely complete the payment process instead of passing the entire PaymentIntent object

router.post('/investopp/pitches/:id/invest/:user_id/pay', async(req, res) => {
    invOpp.findById(req.params.id, async function(err, pitchInDb) {
        if (!err) {

            console.log(req.body)
            const { paymentMethodId, items, currency, chargeAmount } = req.body; //object destructured

            //amount received stored in database, without *100 for stripe
            const amountInDb = chargeAmount

            const amount = chargeAmount * 100; //value charged is amount *100, e.g 10$ -> (10* 100) = 1000

            //Havent added Transaction fees(Stripe + investment fee)
            const stripeFees = 2.9 / 100 + (0.30); //2.9% + 0.30C
            let investmentFees = 1.5 / 100 * amount

            if (amountInDb >= 13400) {
                //investment fee capped at 201$
                investmentFees = 201;
            }

            let amountWithFee = amount + parseInt(stripeFees + investmentFees)

            try {
                // Create new PaymentIntent with a PaymentMethod ID from the client.
                const intent = await stripe.paymentIntents.create({
                    //amount,
                    amount: amountWithFee,
                    currency,
                    payment_method: paymentMethodId,
                    error_on_requires_action: true,
                    confirm: true
                });

                console.log("💰 Payment received!");

                //amounts received by pitch, successful investment

                //array of amounts(actual value)
                pitchInDb.amountReceived.push(amountInDb);

                let amountRaised = 0;
                for (i = 0; i < pitchInDb.amountReceived.length; i++) {
                    amountRaised += parseInt(pitchInDb.amountReceived[i])
                    pitchInDb.amountRaised = amountRaised;

                }

                //save pitchInDb with amount raised
                pitchInDb.save(function(err, pitchInDb) {
                    if (!err) {
                        console.log("Updated pitch " + pitchInDb.amountReceived + "\n" + pitchInDb.amountRaised)

                        //Add pitch invested in to user(for portfolio)
                        User.findById(req.params.user_id, function(err, userInDb) {
                            if (!err) {
                                userInDb.pitchesInvestedIn.addToSet(pitchInDb);

                                //Net worth - sharesReceived Value
                                //const sharesReceived = chargeAmount / pitchInDb.sharePrice
                                userInDb.investments.push(chargeAmount)

                                let netWorth = 0;
                                for (i = 0; i < userInDb.investments.length; i++) {
                                    netWorth += parseInt(userInDb.investments[i])
                                    userInDb.netWorth = netWorth;
                                }

                                //Date of Investments--array
                                //const currentDate = new Date() //current day
                                userInDb.datesOfInvestments.push(new Date())

                                userInDb.pitchesInvestedIn.forEach((pitch) => {
                                    console.log(pitch)

                                    //pitch.dateUserInvested.push(new Date());
                                });

                                userInDb.save(function(err, user) {
                                    if (!err) {
                                        //Add investor to pitch -- addToSet prevent duplicate value e.g so duplicate user object
                                        pitchInDb.investor.addToSet(user);

                                        //After adding investor to pitch
                                        pitchInDb.save()
                                    }
                                });

                            } else {
                                console.log(err.message)
                            }
                        })

                        console.log("New Updated pitch " + pitchInDb.amountReceived + "\n" + pitchInDb.amountRaised)
                    } else {
                        console.log(err)
                    }
                });

                req.user.isInvested = true;
                await req.user.save();

                // The payment is complete and the money has been moved
                // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

                // Send the client secret to the client to use in the demo
                res.send({ clientSecret: intent.client_secret });
            } catch (e) {
                // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
                // See https://stripe.com/docs/declines/codes for more
                if (e.code === "authentication_required") {
                    res.send({
                        error: "This card requires authentication in order to proceeded. Please use a different card."
                    });
                } else {
                    console.log(e.message)
                    res.send({ error: e.message });
                }
            }
        } else {
            console.log(err)
        }
    })
});

//PAY ROUTE

module.exports = router