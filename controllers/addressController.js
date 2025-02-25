const Address = require("../models/addressModel");

exports.addAddress = async (req, res) => {
  try {
    const { address, recieverPhoneNumber, recieverName } = req.body;
    const user = req.user;

    // Kiểm tra xem địa chỉ đã tồn tại chưa
    const existingAddress = await Address.findOne({
      userId: user._id,
      address: address,
    });
    if (existingAddress) {
      return res
        .status(400)
        .json({ message: "This address already exists for this user" });
    }

    // Kiểm tra nếu người dùng đã có địa chỉ nào chưa
    const userHasAddresses = await Address.exists({ userId: user._id });

    // Chưa có địa chỉ, lấy cái đầu tiên làm mặc định
    const newIsDefault = userHasAddresses ? false : true;

    const newAddress = new Address({
      userId: user._id,
      address: address,
      recieverPhoneNumber: recieverPhoneNumber,
      recieverName: recieverName,
      isDefault: newIsDefault,
    });

    await newAddress.save();

    return res.status(200).json({
      status: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.address._id;
    const userId = req.user._id;

    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      userId: userId,
    });

    if (!deletedAddress) {
      return res
        .status(400)
        .json({ status: false, message: "Address not found" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Address deleted successfully" });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = req.user;
    const { address, recieverPhoneNumber, recieverName, isDefault } = req.body;

    const addressToUpdate = await Address.findOne({
      userId: user._id,
      _id: addressId,
    });
    if (!addressToUpdate) {
      return res
        .status(404)
        .json({ status: false, message: "Address not found" });
    }

    addressToUpdate.address = address || addressToUpdate.address;
    addressToUpdate.recieverPhoneNumber =
      recieverPhoneNumber || addressToUpdate.recieverPhoneNumber;
    addressToUpdate.recieverName = recieverName || addressToUpdate.recieverName;
    addressToUpdate.isDefault = isDefault || addressToUpdate.isDefault;

    const updatedAddress = await addressToUpdate.save();

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ status: false, message: "Address save failed" });
    }

    return res.status(200).json({
      status: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllAddresses = async (req, res) => {
  try {
    const userID = req.user._id;

    const addresses = await Address.find({ userId: userID });

    return res.status(200).json({
      status: true,
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.setAddressDefault = async (req, res) => {
  try {
    const { addressId } = req.params;

    const userId = req.user._id;

    const address = await Address.findOne({ userId: userId, _id: addressId });
    if (!address) {
      return res
        .status(404)
        .json({ status: false, message: "Address not found" });
    }

    // Set all address false
    await Address.updateMany({ userId, isDefault: true }, { isDefault: false });

    // set current address true
    address.isDefault = true;
    const updatedAddress = await address.save();

    return res.status(200).json({
      status: true,
      message: "Default address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const defaultAddress = await Address.findOne({
      userId: userId,
      isDefault: true,
    });

    if (!defaultAddress) {
      return res
        .status(404)
        .json({ status: false, message: "Default address not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Default address retrieved successfully",
      data: defaultAddress,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
