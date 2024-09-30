const express = require('express')
const router = express.Router()
const { validateUpdateMiddleware } = require('../middlewares/categoryMiddleware')
const categoryController = require('../controllers/categoryController')

//http:localhost:3000/categories

//create category
router.post('/create-category',validateUpdateMiddleware, categoryController.createCategory)

//delete category
router.delete('/delete-category', categoryController.deleteCategory);


module.exports = router