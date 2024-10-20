const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/get-products-of-catetory/:categoryId', protect, filterController.filterProductsOfCategory)


router.post('/search', protect, filterController.searchProducts);


module.exports = router;