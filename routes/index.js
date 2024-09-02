var express = require('express')
var router = express.Router()

router.get("/", (req, res) => {
    res.json({status: true, msg: "Hello World!"})
})

module.exports = router;
