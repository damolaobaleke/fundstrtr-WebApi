var express = require('express')
var router = express.Router();
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
            //console.log(invOppInDb)
            //res.send({"Investment Opportunites": invOppInDb});
            return successResponseMsg(res, 200, 'pitches fetched', invOppInDb);
        }
    })
})

router.post("/investopp", function(req, res) {
    invOpp.create(req.body.pitch, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            //send an email to business
            var emailText = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><link rel="icon" href="../../assets/img/icons/foundation-favicon.ico" type="image/x-icon"><meta content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0" name="viewport"></head><body style="background:#f3f3f3!important"><style class="float-center" type="text/css"></style><span class="preheader"></span><table class="body" style="background:#f3f3f3!important"><tbody><tr><td align="center" class="center" valign="top"><center data-parsed=""><table class="spacer float-center"><tbody><tr><td height="16px" style="font-size:16px;line-height:16px"></td></tr></tbody></table><table align="center" class="container header float-center" style="background:#f3f3f3;margin-top:5rem"><tbody><tr><td><table class="row"><tbody><tr><th class="small-12 large-12 columns first last"><table><tbody><tr><th><center data-parsed=""></center></th><th class="expander"></th></tr></tbody></table></th></tr></tbody></table></td></tr></tbody></table><table align="center" class="container card float-center" style="background:#FFF;border-radius:40px;box-shadow:0 20px 40px rgba(40,57,144,.25);height:833px"><tbody><tr><td><table class="demo" style="border-collapse:collapse;padding:5px"><tbody><tr><td style="padding:5px"><img class="fs-logo" src="https://res.cloudinary.com/https-eazifunds-com/image/upload/v1598370095/Fundstrtr/Group_1280_cicdhj.png" alt="" style="height:150px;width:150px"></td></tr></tbody></table><table class="row"><tbody><tr><th class="small-12 large-12 columns first last"><table><tbody><tr><th><h1 class="text-center" style="color:#283990;font-family:Montserrat;font-size:32px;font-style:normal;font-weight:700;height:35px;line-height:90%;margin-top:3rem">Welcome ${pitchInDb.firstname} ${pitchInDb.lastname}</h1><table class="spacer"><tbody><tr><td height="32px" style="font-size:32px;line-height:32px"></td></tr></tbody></table><div class="fs-paragraph-pos"><p class="mt-4" style="color:#283990;font-family:Montserrat;font-style:normal;font-weight:400">Hello, welcome to fundstrtr</p><p style="color:#283990;font-family:Montserrat;font-style:normal;font-weight:400">Congratulations on successfully completing your crowdfunding application and for registering your business with us to fuel your investment</p><p style="color:#283990;font-family:Montserrat;font-style:normal;font-weight:400">We will be sure to get back to you in 3-7 working days as regards your application.</p><p style="color:#283990;font-family:Montserrat;font-style:normal;font-weight:400">Remember to check back frequently and if you have any questions fell free to reply to this email and a representative will be happy to help you out.</p><p style="color:#283990;font-family:Montserrat;font-style:normal;font-weight:400">Thanks for choosing fundstrtr, your true path to making your dream a reality !</p><p style="color:#283990;font-family:Montserrat;font-style:normal;font-weight:400">Regards,<br>fundstrtr team.</p></div><center data-parsed=""></center></th><th class="expander"></th></tr></tbody></table></th></tr></tbody></table><table class="spacer"><tbody><tr><td height="16px" style="font-size:16px;line-height:16px"></td></tr></tbody></table></td></tr></tbody></table></center></td></tr></tbody></table></body></html>`
            var emailHtml = emailText;

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: pitchInDb.email,
                from: "info@eazifunds.com",
                subject: 'Fundstrtr - Confirmation of registration',
                text: emailText, //shows in email notification before opening
                html: emailHtml,
            };
            sgMail.send(msg).then(function() {
                console.log("Email sent successfully")

            }).catch(error => {
                console.log(error)
            });


            //send an email to info@eazifunds.com
            var businessInfo = `<h1>Name of Business: ${pitchInDb.registeredCompanyName}</h1>
  
              <h2>Personal Info</h2>
              <ul>
                  <li>email: ${pitchInDb.email}</li>
                  <li>First Name: ${pitchInDb.firstname}</li>
                  <li>Last Name: ${pitchInDb.lastname}</li>
                  <li>Phone Number: ${pitchInDb.phoneNumber}</li>
              </ul>
              <h2>Business & Company Info</h2>
              <ul>
                  <li>Business Type: ${pitchInDb.businessType}</li>
                  <li>Corporate Structure: ${pitchInDb.corporateStructure}</li>
                  <li>Company Number: ${pitchInDb.companyNumber}</li>
                  <li>Company Country: ${pitchInDb.companyCountry}</li>
                  <li>Other Country: None OR ${pitchInDb.otherCountry}</li>
                  <li>Date Founded: ${pitchInDb.dateFounded}</li>
                  <li>Date Incorporated: ${pitchInDb.dateIncorporated}</li>
                  <li>Raising Amount: ${pitchInDb.raisingAmount}</li>
                  <li>Raising Type: ${pitchInDb.raisingType}</li>
                  <li>Trading Name: ${pitchInDb.tradingName}</li>
                  <li>Address:${pitchInDb.addressLine1}, ${pitchInDb.addressLine2} </li>
                  <li>City: ${pitchInDb.city}</li>
                  <li>Company Website: ${pitchInDb.companyWebsite}</li>
                  <li>Executive Summary: ${pitchInDb.executiveSummary}</li>
                  <li>
                      Milestone: ${pitchInDb.milestone}
                  </li>
                  <li>Equity Offer: ${pitchInDb.equityOffer}</li>
                  <li style="color: red;">Pre-money Valuation: ${pitchInDb.premoneyValuation}</li>
                  <li>Share Price: ${pitchInDb.sharePrice}</li>
                  <li>Share Type: ${pitchInDb.shareType}</li>
              
              </ul>
              
              <h2>Social Media</h2>
              
              <ul>
                  <li>Facebook URL: ${pitchInDb.facebookUrl }</li>
                  <li>Twitter URL: ${pitchInDb.twitterUrl}</li>
                  <li>Instagram URL: ${pitchInDb.instagramUrl}</li>
                  <li>LinkedIn URL: ${pitchInDb.linkedinUrl}</li>
              </ul>`

            const msgInfo = {
                to: 'eazifunds@gmail.com',
                from: 'info@eazifunds.com',
                subject: 'Registered Business',
                text: emailText, //shows in email notification before opening
                html: businessInfo,
            };
            sgMail.send(msgInfo).then(function() {
                console.log("Email sent successfully")

                //show a flash message
                req.flash("success_message", "You've been registered successfully, Thank you !")
            }).catch(error => {
                console.log(error)
            })

            console.log(pitchInDb)
            res.redirect('/investopp/pitches/' + pitchInDb._id + '/details/edit/dashboard')
        }
    })

    //redirect back to investment pitches OR manage pitch ? thinkaboutit
    //res.redirect('/investopp')
})

//SHOW-- NOT NEEDED
router.get("/investopp/pitches/:id/details", isLoggedIn, function(req, res) {
    invOpp.findById(req.params.id).populate("discussion").exec(function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.send({ "investment opportunities detailed": pitchInDb })
        }
    })
})

//EDIT PITCH
//Normal form editing
router.get("/investopp/pitches/:id/details/edit", function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("ManagePitch/editPitch", { data: pitchInDb })
        }
    })
})


//===Using DashBoard====
router.get("/investopp/pitches/:id/details/edit/dashboard", checkPitchOwnership, function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("ManagePitch/editPitchDashboard", { data: pitchInDb, currentUser: req.user })
            console.log(req.user) // passport adds current user to request
        }
    })
})

//profile
router.get("/investopp/pitches/:id/details/edit/profile", function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("ManagePitch/editPitchProfile", { data: pitchInDb })
        }
    })
})

//business info
router.get("/investopp/pitches/:id/details/edit/business_information", function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("ManagePitch/editPitchBusinessInfo", { data: pitchInDb })
        }
    })
})

router.get("/investopp/pitches/:id/details/edit/company_information", function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("ManagePitch/editPitchCompanyInfo", { data: pitchInDb })
        }
    })
})

//company docs
router.get("/investopp/pitches/:id/details/edit/company_documents", function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("ManagePitch/editPitchDocuments", { data: pitchInDb })
        }
    })
})

//settings
router.get("/investopp/pitches/:id/details/settings", function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            res.render("ManagePitch/pitchSettings", { data: pitchInDb })
        }
    })
})

//EDIT PITCH

//UPDATE PITCH
router.put("/investopp/pitches/:id/", function(req, res) {
    invOpp.findByIdAndUpdate(req.params.id, req.body.pitch, function(err, UpdatedPitchInDb) {
        if (err) {
            console.log(err)
            res.redirect("/investopp")
        } else {
            console.log(UpdatedPitchInDb)
            res.redirect("/investopp/pitches/" + req.params.id + "/details") //GET pitch details
        }

    })
})

//REMOVE PITCH--DANGER!
router.delete("/investopp/pitches/:id/", function(req, res) {
    invOpp.findByIdAndRemove(req.params.id, function(err, pitchInDb) {
        if (!err) {
            res.redirect("/investopp")
            console.log("deleted pitch" + "\n" + pitchInDb)
        } else {
            console.log(err)
            res.redirect("/investopp")
        }

    })
})

//PAYMENT/Investing ROUTES
router.get("/investopp/pitches/:id/invest", isLoggedIn, function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            console.log("User info \n" + req.user)
            res.render('Investing/investInPitch', { data: pitchInDb })
        }
    })
})

//PAY ROUTE

//Included in the returned PaymentIntent is a client secret, which is used on the client side to 
//securely complete the payment process instead of passing the entire PaymentIntent object

router.post('/pay', async(req, res) => {
    console.log(req.body)
    const { paymentMethodId, items, currency, chargeAmount } = req.body; //object destructured

    const amount = chargeAmount * 100; //value charged is amount *100, e.g 10$ -> (10* 100) = 1000

    //Havent added Transaction fees(Stripe + investment fee)
    const stripeFees = 0.59;
    const investmentFees = 1.5 / 100 * amount

    try {
        // Create new PaymentIntent with a PaymentMethod ID from the client.
        const intent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            error_on_requires_action: true,
            confirm: true
        });

        console.log("💰 Payment received!");

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
});
//PAYMENT ROUTES

//Due diligence charter
router.get("/due-diligence-charter", function(req, res) {
    res.render("InvOpp/dueDiligenceCharter")

})


//Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // the next thing to run
    } else {
        req.flash('error_message', "You need to be logged in to view that!")
        console.log("You are not logged in")
        res.redirect("/") //should be redirecting to /login(but its a modal) showing modal login
    }
}

function checkPitchOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        invOpp.findById(req.params.id, function(err, pitchInDb) {
            if (err) {
                console.log(err)
                res.redirect("back")
            } else {
                //does user own pitch
                console.log(pitchInDb.email + " compared to" + req.user.email)
                if (pitchInDb.email === req.user.email) {
                    next()
                } else {
                    res.redirect("back")
                }
            }
        })
    } else {

    }
}

module.exports = router