const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  address: { type: String, required: true },
  recieverPhoneNumber: { type: String, required: true },
  recieverName: { type: String, required: true },
  isDefault: { type: Boolean },
});

module.exports =
  mongoose.models.addresses || mongoose.model("address", addressSchema);
