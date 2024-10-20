const Ship = require("../models/shippingModel");

exports.createShip = async (req, res) => {
  const { name, deliveryTime, cost, trackingAvailable } = req.body;

  try {
    const newCompany = await Ship.create({
      name,
      deliveryTime,
      cost,
      trackingAvailable,
    });
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getShip = async (req, res) => {
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
    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteShip = async (req, res) => {
  try {
    const deletedCompany = await Ship.findByIdAndDelete(req.params.id);
    if (!deletedCompany)
      return res.status(404).json({ message: "Company not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
