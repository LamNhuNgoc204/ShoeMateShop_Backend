const User = require("../models/userModel");
const { hashPassword } = require("../utils/encryptionUtils");
const { isValidPhoneNumber } = require("../utils/numberUtils");

exports.getUserInfo = async (req, res) => {
  try {
    const user = req.user;

    const information = {
      email: user.email,
      phone: user.phoneNumber,
      name: user.name,
      role: user.role,
      device_info: user.device_info,
      wallet: user.wallet,
      address: user.address,
      search: user.search,
      cart: user.cart,
      wishlist: user.wishlist,
    };

    return res.status(200).json({
      status: true,
      message: "User information retrieved successfully.",
      data: information,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, avatar, phoneNumber } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      console.log("user not found");

      return res
        .status(401)
        .json({ status: false, message: "User does not exist!" });
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      console.log("phone invalid");

      return res
        .status(402)
        .json({ status: false, message: "Invalid phone number" });
    }

    user.name = name ? name : user.name;
    user.avatar = avatar ? avatar : user.avatar;
    user.phoneNumber = phoneNumber ? phoneNumber : user.phoneNumber;

    const updatedUser = await user.save();
    if (!updatedUser) {
      console.log("update failed");

      return res
        .status(403)
        .json({ status: false, message: "Update user info failed" });
    }

    return res.status(200).json({
      status: true,
      message: "User profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "user", "employee"].includes(role)) {
      return res.status(404).json({ status: false, message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(402).json({ status: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ status: true, message: "update role success", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error });
  }
};

exports.getAllUser = async (_, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });

    return res
      .status(200)
      .json({ status: true, message: "Get all users success", data: users });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.adddNewUser = async (req, res) => {
  try {
    const { email, password, name, phoneNumber, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email already in use." });
    }

    if (!["admin", "user", "employee"].includes(role)) {
      return res.status(404).json({ status: false, message: "Invalid role" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      role: role,
      isVerified: false,
    });

    await newUser.save();

    return res.status(201).json({
      status: true,
      data: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
        isVerified: newUser.isVerified,
      },
      message: "User registered successfully! Please verify your email.",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


exports.refreshFcmToken = async(req, res) => {
  try {
    const user = req.user;
    const { token } = req.body;
    const updatedUser = await User.findByIdAndUpdate(user._id,{FCMToken: token});
    if(updatedUser) {
      return res.status(200).json({
        status: true,
        message: "Token added successfully",
      });
    } 
    return res.status(400).json({
      status: false,
      message: "Token not found",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
}
exports.LockAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    user.isActive = false;
    const data = await user.save();

    return res.status(200).json({ status: 200, data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


exports.addSearch = async(req, res) => {
  try {
     let user = req.user;
     if(!req.body.search) {
       return res.status(400).json({ status: false, message: "Search field is required" });
     }
     if(user.searchHistory.includes(req.query.search)) {
      user.searchHistory = user.searchHistory.filter(search => search != req.body.search);
     }
     user.searchHistory = [...user.searchHistory, req.body.search];
     const updatedUser = await user.save();
     return res.status(200).json({ status:true, data:updatedUser, message: 'Update successful' });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });  
  }
}

exports.removeSearch = async (req, res) => {
  try {
    const user = req.user;
    if(!req.body.search) {
      return res.status(400).json({ status: false, message: "Search field is required" });
    }
    const userTemp = await User.findById(user._id);
    const searchs = userTemp.searchHistory;
    const updatedSearchs = searchs.filter(search => search != req.body.search)
    const updatedUser = await User.findByIdAndUpdate(user._id,{searchHistory: updatedSearchs})
    return res.status(200).json({ status:true, data:updatedUser, message: 'remove search success' });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
    
  }
}

exports.getSearchHistories = async (req,res) => {
  try {
    const user = req.user;
    const userTemp = await User.findById(user._id);
    console.log("searchs: ", userTemp.searchHistory)
    return res.status(200).json({ status:true, data: userTemp.searchHistory, message: 'Get search histories success' });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
}
