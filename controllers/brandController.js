const Brands = require("../models/brandModel");

exports.createBrand = async (req, res) => {
  try {
    const { name, image } = req.body;
    const existBrand = await Brands.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existBrand) {
      return res
        .status(402)
        .json({ status: false, message: "Brand name already exists!" });
    }
    const newBrand = await Brands.create({
      name,
      image,
    });

    return res.status(200).json({
      status: true,
      message: "Brand created successfully",
      data: newBrand,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
