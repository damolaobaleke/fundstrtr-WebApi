var express = require('express')
var router = express.Router()


//Show routes to all endpoints
router.get("/", function(req, res) {
    res.send({
        pitches_url: "https://api.fundstrtr.com/investopp",
        users_url: "https://api.fundstrtr.com/users"
    });
})

module.exports = router;