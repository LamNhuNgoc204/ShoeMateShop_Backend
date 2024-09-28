const User = require('../models/userModel')
const {checkPassword, hashPassword} = require('../utils/encryptionUtils')

exports.resetPassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        
        // Validate user input
        if (!userId ||!oldPassword ||!newPassword) {
            return res.status(400).json({status: false, message: "Please provide all required fields." });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found." });
        }

        // Check if old password is correct
        const isPasswordCorrect = await checkPassword(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ status: false, message: "Old password is incorrect." });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();


        const newUser = user.toObject();
        delete newUser.password;


        return res.json(200).status({ status: true, message: "New password had been changed successfully!", data:  newUser});
    } catch (error) {
        console.log('reset password err: ', error);
        return res.status(500).json({status: false, message: 'server error'})
    }
}