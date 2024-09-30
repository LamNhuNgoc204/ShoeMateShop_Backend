const Category = require('../models/categoryModel')

exports.createCategory = async (req, res, next) => {
    try {
        const {name, image , description} = req.body;
        const existCategory = await Category.find({name: name})
        if(existCategory.length > 0) {
            return res.status(400).json({ status: false, message: "Category name already exists!" });
        }
        const savedCategory = await Category.create({
            name,
            image,
            description
        })
        return res.status(200).json({
            status: true,
            message: "Category created successfully",
            data: savedCategory
        })
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });  
    }
}