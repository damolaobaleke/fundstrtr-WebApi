const mongoose = require("mongoose")

const discussionSchema = new mongoose.Schema({
    //author: String,
    comment: String,
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        username: String
    }
},{
    timestamps: true
})

const discussion = mongoose.model("discussion", discussionSchema);
module.exports = discussion;