var mongoose = require("mongoose")

var discussionSchema = mongoose.Schema({
    //author: String,
    comment: String,
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        username: String
    }
})

var discussion = mongoose.model("discussion", discussionSchema);
module.exports = discussion;