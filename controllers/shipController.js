const Ship = require("../models/shippingModel");
const Order = require("../models/orderModel");
const OrderDetail = require("../models/orderDetailModel");

exports.getShipDefault = async (_, res) => {
  try {
    const result = await Ship.findOne({ isDefault: true });

    if (result) {
      return res.status(200).json({ status: true, data: result });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createShip = async (req, res) => {
  const { name, deliveryTime, cost, isDefault = true } = req.body;

  try {
    if (isDefault) {
      await Ship.updateMany({ isDefault: true }, { isDefault: false });
    }

    const newCompany = await Ship.create({
      name,
      deliveryTime,
      cost,
      isDefault: !!isDefault,
    });

    res.status(201).json(newCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getShip = async (req, res) => {
  try {
    const companies = await Ship.find({ isActive: true });
    res.status(200).json({ status: true, data: companies });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.getShipForWeb = async (req, res) => {
  try {
    const companies = await Ship.find();

    res.status(200).json({ status: true, data: companies });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.getOneShip = async (req, res) => {
  try {
    const company = await Ship.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateShip = async (req, res) => {
  try {
    const updatedCompany = await Ship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCompany)
      return res.status(404).json({ message: "Company not found" });
    res.status(200).json({ status: true, data: updatedCompany });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

exports.updateStarus = async (req, res) => {
  try {
    const updatedCompany = await Ship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCompany)
      return res
        .status(404)
        .json({ status: false, message: "Company not found" });

    res.status(200).json({ status: true, data: updatedCompany });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

exports.getOrderForShip = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["processing", "delivered"] },
    }).populate("shipping_id", "name");

    const orderIds = orders.map((order) => order._id);
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orderIds },
    }).populate("product.id");

    console.log(orders.map((order) => order.returnRequest));

    const ordersWithDetails = orders.map((order) => {
      const details = orderDetails.filter((detail) =>
        detail.order_id.equals(order._id)
      );
      return {
        ...order.toObject(),
        orderDetails: details,
      };
    });

    return res.status(200).json({
      status: true,
      data: ordersWithDetails,
    });
  } catch (error) {
    console.log("errror: ", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
