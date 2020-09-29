const mongoose = require("mongoose")
const replySchema = mongoose.Schema({
    //author: String,
    reply: String,
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        username: String
    },
})

const reply = mongoose.model("reply", replySchema);
module.exports = reply;