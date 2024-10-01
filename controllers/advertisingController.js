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
// Lọc quảng cáo
  exports.getAllAds = async (req, res) => {
    try {
      const { status } = req.query; // Lọc theo trạng thái
     
  
      let query = {};
      if (status) {
        query.status = status;
      }
      console.log(query);
      const ads = await Ad.find(query).populate("productId", "name price assets");
      res.status(200).json(ads);
    } catch (error) {
      res.status(500).json({ message: "Error fetching ads", error });
    }
  };
  
  // Tang so luong luot xem
  exports.incrementAdViews = async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id);
  
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
  
      // Kiểm tra trạng thái nếu đã hết hạn
      if (new Date(ad.endDate) < new Date()) {
        ad.status = "expired";
      } else {
        ad.views += 1;
      }
  
      await ad.save();
      res.status(200).json({ message: "Views incremented", views: ad.views });
    } catch (error) {
      res.status(500).json({ message: "Error incrementing views", error });
    }
  };
  
// Xóa quảng cáo theo ID (Chỉ admin hoặc nhân viên)
exports.deleteAd = async (req, res) => {
    try {
      const deletedAd = await Ad.findByIdAndDelete(req.params.id);
  
      if (!deletedAd) {
        return res.status(404).json({ message: "Ad not found" });
      }
  
      res.status(200).json({ message: "Ad deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting ad", error });
    }
  };
  
  // Lấy quảng cáo theo ID
exports.getAdById = async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id).populate("productId", "_id name price");
  
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
  
      res.status(200).json(ad);
    } catch (error) {
      res.status(500).json({ message: "Error fetching ad", error });
    }
  };

  // Lấy quảng cáo theo loại (category)
exports.getAdsByCategory = async (req, res) => {
    try {
      const { category } = req.params;
  
      const ads = await Ad.find({ category }).populate("productId", "name price");
  
      if (ads.length === 0) {
        return res.status(404).json({ message: "No ads found for this category" });
      }
  
      res.status(200).json(ads);
    } catch (error) {
      res.status(500).json({ message: "Error fetching ads", error });
    }
  };

  // Tăng lượt click quảng cáo
exports.incrementAdClicks = async (req, res) => {
    try {
      const ad = await Ad.findById(req.params.id);
  
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
  
      ad.clicks += 1;
      await ad.save();
  
      res.status(200).json({ message: "Clicks incremented", clicks: ad.clicks });
    } catch (error) {
      res.status(500).json({ message: "Error incrementing clicks", error });
    }
  };
  