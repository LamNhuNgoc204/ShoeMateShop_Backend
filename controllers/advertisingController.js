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
  // Cấp nhật adversiting
  exports.updateAd = async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
  
      // Kiểm tra startDate nhỏ hơn endDate
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }
  
      // Cập nhật quảng cáo
      const updatedAd = await Ad.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          status: new Date(endDate) < new Date() ? "expired" : req.body.status, // Tự động cập nhật trạng thái
        },
        { new: true, runValidators: true }
      );
  
      if (!updatedAd) {
        return res.status(404).json({ message: "Ad not found" });
      }
  
      res.status(200).json({ message: "Ad updated successfully", ad: updatedAd });
    } catch (error) {
      res.status(500).json({ message: "Error updating ad", error });
    }
  };
  