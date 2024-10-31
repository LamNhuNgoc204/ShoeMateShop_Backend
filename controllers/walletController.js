const Wallet = require("../models/walletModel");
const { hashPassword, checkPassword } = require("../utils/encryptionUtils");

exports.registerWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    const { pin } = req.body;

    const hashPin = await hashPassword(pin);
    const wallet = new Wallet({
      user_id: userId,
      pin: hashPin,
    });

    const result = await wallet.save();

    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.log("register wallet error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.authenticateWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("userId: ", userId);

    const { pin } = req.body;

    if (!pin) {
      return res
        .status(400)
        .json({ status: false, message: "Pin is required" });
    }

    const walletUser = await Wallet.findOne({ user_id: userId });
    if (!walletUser) {
      return res
        .status(404)
        .json({ status: false, message: "Wallet not found" });
    }

    const checkPin = await checkPassword(pin, walletUser.pin);
    if (!checkPin) {
      return res.status(400).json({ status: false, message: "Pin not match" });
    }

    return res.status(200).json({ status: 200, message: "Access" });
  } catch (error) {
    console.log(" Error auth wallet: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.deposit = async (req, res) => {
  try {
    const userId = req.user._id;
  } catch (error) {
    console.log(" Error auth wallet: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
