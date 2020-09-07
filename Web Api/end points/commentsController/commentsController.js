var express = require('express')
var router = express.Router()


//Models
var invOpp = require('../../models/investmentopportunities')
var discussion = require('../../models/discussion')
var User = require('../../models/user')

//COMMENTS Routes  --Nested
router.get("/investopp/pitches/:id/details/comments/new", function(req, res) {
    invOpp.findById(req.params.id, function(err, pitchesinDB) {
        if (err) {
            console.log(err)
        } else {
            res.render("Comments/newComments", { data: pitchesinDB })
        }
    })
})

//Display all comments on separate page as well --ENDPOINT
router.get("/pitches/discussions/:id/details/comments", function(req, res) {
    invOpp.findById(req.params.id).populate("discussion").exec(function(err, pitchesinDB) {
        if (err) {
            console.log(err)
        } else {
            console.log("Pitch" + pitchesinDB.discussion)
            res.send({ "Discussions": pitchesinDB.discussion });
        }
    })
})

//Create comment
router.post("/investopp/pitches/:id/details/comments/", function(req, res) {
    var discussionbody = { author: req.body.author, comment: req.body.comment }
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            //console.log("pitch in db\n" + pitchInDb)
            discussion.create(discussionbody, function(err, discussionInDb) {
                if (!err) {
                    //add username and id to comment 
                    discussionInDb.author.id = req.user._id
                    discussionInDb.author.username = req.user.username

                    //then save comment
                    discussionInDb.save();
                    console.log(discussionInDb)

                    //add comments to pitch
                    pitchInDb.discussion.push(discussionInDb)

                    //save pitch with comments --commentsInDb == discussionInDb
                    pitchInDb.save(function(err, commentsInDb) {
                        if (err) {
                            console.log("Error creating comment" + err)
                        } else {
                            //console.log(commentsInDb)
                            res.redirect("/investopp/pitches/" + pitchInDb._id + "/details/");
                        }
                    })
                } else {
                    //show error message
                    console.log("error creating" + err);
                }

            })
        }
    })

})

//Edit Comments
router.get("/investopp/pitches/:id/details/comments/:comment_id/edit", checkCommentOwnership, function(req, res) {
    //note, if nested route comments is defined with ":id" would override first id, so give distinct name
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            discussion.findById(req.params.comment_id, function(err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("discussion data \n" + comment)

                    //edit Modal
                    res.render("Comments/editComment", { data: pitchInDb, discussiondata: comment })
                }
            })
        }
    })
})

//Update Comments
router.put("/investopp/pitches/:id/details/comments/:comment_id/", function(req, res) {
    discussion.findByIdAndUpdate(req.params.comment_id, req.body.pitch, function(err, updatedCommentsIndb) {
        if (err) {
            console.log(err)
            req.flash("error_message", err.message)
        } else {
            console.log(req.body)
            console.log("Updated comment" + updatedCommentsIndb)

            res.redirect("/investopp/pitches/" + req.params.id + "/details")
        }
    })
})


//Delete Comment -Update
router.delete("/investopp/pitches/:id/details/comments/:comment_id/", checkCommentOwnership, (req, res) => {
    discussion.findByIdAndRemove(req.params.comment_id, function(err, comments) {
        if (!err) {
            console.log("deleted comment" + "\n" + comments)
            res.redirect("/investopp/pitches/" + req.params.id + "/details")
        } else {
            req.flash("error_message", err.message)
            console.log(err)
        }
    })
})


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // the next thing to run
    } else {
        req.flash('error_message', "You need to Login!")
        console.log("You are not logged in")
        res.redirect("/") //should be redirecting to /login(but its a modal) showing modal login
    }
}

//
function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        discussion.findById(req.params.comment_id, function(err, commentInDb) {
            if (err) {
                console.log(err)
                res.redirect("back")
            } else {
                //does user own comment
                if (commentInDb.author.id.equals(req.user._id)) {
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