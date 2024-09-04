var express = require('express')
var router = express.Router()
require('dotenv').config();

router.get("/", (req, res) => {
    res.json({status: true, msg: "Hello World!"})
})

module.exports = router;
