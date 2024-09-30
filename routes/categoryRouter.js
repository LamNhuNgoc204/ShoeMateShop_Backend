const express = require('express')
const router = express.Router()
const { validateCreateCategory, validateUpdateCategory } = require('../middlewares/categoryMiddleware')
const categoryController = require('../controllers/categoryController')

//http:localhost:3000/categories

//create category
router.post('/create-category',validateCreateCategory, categoryController.createCategory)

//delete category
router.delete('/delete-category', categoryController.deleteCategory);

//update category
router.put('/update-category', validateUpdateCategory, categoryController.updateCategory)

//get all categories  
router.get('/get-categories', categoryController.getAllCategories)

//get category by id
router.get('/get-category/:id', categoryController.getCategory)

module.exports = router