const Size = require("../models/sizeModel");

exports.createSize = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: false,
        message: "Name is required",
      });
    }

    const checkSize = await Size.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (checkSize) {
      return res.status(400).json({
        status: false,
        message: "This size is exits",
      });
    }

    const newSize = new Size({
      name,
    });

    await newSize.save();

    return res.status(200).json({
      status: true,
      message: "Create successully",
      data: newSize,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllSizes = async (_, res) => {
  try {
    const data = await Size.find();

    return res
      .status(200)
      .json({ status: true, message: "get size success", data: data });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
