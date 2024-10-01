const Ad = require("../models/adversitingModel");
const Product = require("../models/productModel");

// Tạo quảng cáo mới (Chỉ admin hoặc nhân viên)
exports.createAd = async (req, res) => {
    try {
      const { productId, title, description, backgroundUrl, category, startDate, endDate } = req.body;
      const { _id: creator } = req.user;
  
      const newAd = new Ad({
        productId,
        title,
        description,
        backgroundUrl,
        creator,
        category,
        startDate,
        endDate,
      });
  
      const savedAd = await newAd.save();
      res.status(201).json({ message: "Ad created successfully", ad: savedAd });
    } catch (error) {
      res.status(500).json({ message: "Error creating ad", error });
    }
  };