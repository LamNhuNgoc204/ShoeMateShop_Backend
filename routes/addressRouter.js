const express = require("express");
const router = express.Router();
const addressController = require('../controllers/addressController')

//http:  http://localhost:3000/addresses

// Add user's address
router.post('/add-address/:userId')

module.exports = router;
