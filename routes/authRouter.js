var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/authController')


//methods:  PUT
//http:  http://localhost:8080

router.put('/reset-password', AuthController.resetPassword)


module.exports = router;