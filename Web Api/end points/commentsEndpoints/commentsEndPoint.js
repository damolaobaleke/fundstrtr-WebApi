const express = require('express')
const router = express.Router()

// middleware
const middleware = require('../../middleware/auth');

//Models
const invOpp = require('../../models/investmentopportunities')
const discussion = require('../../models/discussion')
const reply = require('../../models/reply');

const { successResponseMsg, errorResponseMsg } = require('../../utils/responses')

//COMMENTS EndPoints

router.get("/investopp/pitch/:id/discussion", middleware.isLoggedIn, function(req, res) {
    invOpp.findById(req.params.id).populate({ path: 'discussion', populate: { path: 'replies', model: 'reply' } }).exec(function(err, pitchesinDB) {
        if (err) {
            console.log(err)
            return errorResponseMsg(res, 400, err.message);
        } else {
            return successResponseMsg(res, 200, 'Discussion fetched', pitchesinDB.discussion);
        }
    })
})

//Create comment
router.post("/investopp/pitch/:id/discussion/create", middleware.isLoggedIn, function(req, res) {
    const discussionbody = { author: req.body.author, comment: req.body.comment }
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
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
                            return errorResponseMsg(res, 400, err.message);
                        } else {
                            return successResponseMsg(res, 200, 'Created  discussion successfully', commentsInDb);
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


//Update Comments
router.put("/investopp/pitch/:id/details/comments/:comment_id/", function(req, res) {
    discussion.findByIdAndUpdate(req.params.comment_id, req.body.pitch, function(err, updatedCommentsIndb) {
        if (err) {
            console.log(err)
            return errorResponseMsg(res, 400, err, null)
        } else {
            console.log(req.body)
            console.log("Updated comment" + updatedCommentsIndb)

            return successResponseMsg(res, 200, "updated comment", updatedCommentsIndb)
        }
    })
})


//Delete Comment -Update
router.delete("/investopp/pitches/:id/details/comments/:comment_id/", middleware.checkCommentOwnership, (req, res) => {
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

//REPLIES

router.post("/investopp/pitches/:id/details/comments/:comment_id/replies", middleware.isLoggedIn, function(req, res) {
    var replybody = { author: req.body.author, reply: req.body.reply }
    invOpp.findById(req.params.id, function(err, pitchInDb) {
        if (err) {
            console.log(err)
        } else {
            //console.log("pitch in db\n" + pitchInDb)
            reply.create(replybody, function(err, replyInDb) {
                if (!err) {
                    //add username and id to the reply 
                    replyInDb.author.id = req.user._id
                    replyInDb.author.username = req.user.username

                    //then save reply
                    replyInDb.save();
                    console.log(replyInDb)


                    //Add replies to comments inside the pitch
                    discussion.findById(req.params.comment_id, function(err, commentInDb) {
                        if (!err) {
                            console.log(`Before reply added\n: ${commentInDb}`)

                            //Add replies to comments
                            commentInDb.replies.push(replyInDb);

                            //save comments in db with replies
                            commentInDb.save(function(err, updatedWithReply) {
                                if (!err) {
                                    //Updated comment with reply
                                    console.log(`After reply added\n: ${updatedWithReply}`)
                                }
                            })

                            //Add comments with replies to pitch

                            pitchInDb.discussion.push(commentInDb)

                            //save pitch

                            //save pitch with replies in comments after adding replies --replyInDb
                            pitchInDb.save(function(err, pitchInDb) {
                                if (err) {
                                    console.log("Error creating reply to comment" + err)
                                } else {
                                    console.log(pitchInDb)
                                    res.redirect("/investopp/pitches/" + pitchInDb._id + "/details/");
                                }
                            });

                        } else {
                            console.log(err);
                        }

                    });

                } else {
                    //show error message
                    console.log("error creating" + err);
                }

            })
        }
    })
})

module.exports = router