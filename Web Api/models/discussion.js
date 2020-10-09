const mongoose = require("mongoose")

const discussionSchema = new mongoose.Schema({
    //author: String,
    comment: String,
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        username: String
    },

    //Associate replies to comments by reference
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "reply"
    }],
    timestamps: { type: Boolean, default: true },
    datecreated: { type: Date, default: Date.now }
})

const discussion = mongoose.model("discussion", discussionSchema);
module.exports = discussion;