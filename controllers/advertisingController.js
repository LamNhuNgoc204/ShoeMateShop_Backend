const Ad = require("../models/adversitingModel");
const Product = require("../models/productModel");

exports.createAd = async (req, res) => {
    try {
      const { productId, title, description, backgroundUrl, category, startDate, endDate } = req.body;
      const { _id: creator } = req.user;
  
      // Kiểm tra startDate nhỏ hơn endDate
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }
  
      // Kiểm tra sản phẩm có tồn tại không
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      const newAd = new Ad({
        productId,
        title,
        description,
        backgroundUrl,
        creator,
        category,
        startDate,
        endDate,
        status: new Date(startDate) <= new Date() ? "active" : "inactive", 
      });
  
      const savedAd = await newAd.save();
      res.status(201).json({ message: "Ad created successfully", ad: savedAd });
    } catch (error) {
      res.status(500).json({ message: "Error creating ad", error });
    }
  };
  