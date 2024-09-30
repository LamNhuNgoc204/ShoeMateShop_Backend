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

exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId }= req.body;
        if(!categoryId) {
            return res.status(400).json({ status: false, message: "Category ID is required!" });
        }
        const category = await Category.findById(categoryId);
        if(!category) {
            return res.status(400).json({ status: false, message: "Category not found!" });
        }
        await Category.findByIdAndDelete(categoryId)
        return res.status(200).json({ status: true, message: "Category deleted successfully!" });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const {categoryId, name, image} = req.body;
        const category = await Category.findById(categoryId);
        if(!category) {
            return res.status(400).json({ status: false, message: "Category not found!" });
        }
        if(name) {
            category.name = name;
        }
        if(image) {
            category.image = image;
        }
        const updatedCategory = await category.save();
        return res.status(200).json({ status: true, message: "Category updated successfully", data: updatedCategory });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }

}