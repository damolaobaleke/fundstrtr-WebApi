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
                    //amountWithFee,
                    amount: amountWithFee,
                    currency,
                    customer: req.user.stripeCustomerId,
                    payment_method: paymentMethodId,
                    error_on_requires_action: true,
                    setup_future_usage: 'off_session',
                    //off_session: true,
                    confirm: true,
                    capture_method: 'manual', //capture the amount-- dont debit immediately
                });

                //capture authorized funds
                // const captureIntent = await stripe.paymentIntents.capture(intent.id, {
                //     metadata: {
                //         address: req.user.addressLine1,
                //         phone: req.user.phoneNumber,
                //     },
                //     description: `${pitchInDb.tradingName} Investment`
                // })
                // console.log(`The captured intent: ${captureIntent}`)

                // Confirm the PaymentIntent to place a hold on the card-- Another way
                //let captureIntent = await stripe.paymentIntents.confirm(intent.id);

                // if (captureIntent.status === "requires_capture") {
                //     console.log("❗ Charging the card for: " + captureIntent.amount_capturable);
                //     captureIntent = await stripe.paymentIntents.capture(intent.id);
                // }


                console.log("💰 Payment received!");

                //amounts received by pitch, successful investment
                pitchInDb.amountReceived.push(amountInDb);

                let amountRaised = 0;
                for (i = 0; i < pitchInDb.amountReceived.length; i++) {
                    amountRaised += parseInt(pitchInDb.amountReceived[i])
                    pitchInDb.amountRaised = amountRaised;

                }

                //save pitchInDb with amount raised
                pitchInDb.save(function(err, pitchInDb) {
                    if (!err) {
                        console.log(`pitch: amount recieved::${pitchInDb.amountReceived} amount raised::${pitchInDb.amountRaised}`)

                        //Add pitch invested in to user(for portfolio)
                        User.findById(req.params.user_id, function(err, userInDb) {
                            if (!err) {
                                userInDb.pitchesInvestedIn.addToSet(pitchInDb);
                                /*Net worth - sharesReceived Value*/

                                //const sharesReceived = chargeAmount / pitchInDb.sharePrice
                                //userInDb.investments.push(chargeAmount) //old MODEL

                                let invObj = {
                                    amount: [chargeAmount],
                                    tradingName: pitchInDb.tradingName,
                                    datesOfInvestments: [new Date()]
                                }

                                //if trading name exists in array of investments
                                let tradingObjS = userInDb.investments.find((inv) => {
                                    return inv.tradingName == pitchInDb.tradingName
                                })

                                if (tradingObjS != null) {
                                    //add amount to amount array field and date to datefield
                                    //in unique object
                                    tradingObjS.amount.push(chargeAmount);
                                    tradingObjS.datesOfInvestments.push(new Date())
                                } else {
                                    //if not push  or create new investment object in investment
                                    userInDb.investments.addToSet(invObj);
                                }
                                //userInDb.investments.addToSet(invObj);


                                let netWorth = 0;
                                userInDb.investments.forEach((investment) => {
                                    investment.amount.forEach((amount) => {

                                        netWorth += parseInt(amount)
                                        userInDb.netWorth = netWorth;
                                    })
                                })


                                userInDb.save(function(err, user) {
                                    if (!err) {
                                        //Add investor to pitch -- addToSet prevent duplicate value e.g so duplicate user object
                                        pitchInDb.investor.addToSet(user);
                                        console.log(user)

                                        //After adding investor to pitch
                                        pitchInDb.save()
                                    }
                                });

                            } else {
                                console.log(err.message)
                            }
                        })

                        console.log(`Updated pitch: amount received:: ${pitchInDb.amountReceived}  amount raised:: ${pitchInDb.amountRaised}`)
                    } else {
                        console.log(err)
                    }
                });

                req.user.isInvested = true;
                await req.user.save();

                // The payment is complete and the money has been moved

                // Send the client secret generated from intent to confirm payment on client side.
                res.send({ clientSecret: intent.client_secret });

            } catch (e) {
                // See https://stripe.com/docs/declines/codes
                if (e.code === "authentication_required") {
                    // Bring the customer back on-session to authenticate the purchase
                    // send an email or app notification
                    const msgInfo = {
                        to: req.user.email,
                        from: 'info@eazifunds.com',
                        subject: 'Transaction Failed',
                        text: "Your card is being charged",
                        html: '<p>Your card is about to be charged, please authenticate this</p>',
                    };
                    sgMail.send(msgInfo)

                    res.send({
                        error: "This card requires authentication in order to proceed. Please use a different card.",
                        paymentMethod: e.raw.payment_method.id,
                        clientSecret: e.raw.payment_intent.client_secret,
                        amount: amountWithFee,
                        card: {
                            brand: e.raw.payment_method.card.brand,
                            last4: e.raw.payment_method.card.last4
                        }

                    });
                } else if (e.code) {
                    // The card was declined for other reasons (e.g. insufficient funds)
                    // Bring the customer back on-session to ask for a new payment method
                    res.send({
                        error: e.code,
                        clientSecret: e.raw.payment_intent.client_secret,
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