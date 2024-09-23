const mongoose = require('mongoose')
const voucherSchema = new mongoose.Schema({

})

module.exports = mongoose.models.vouchers || mongoose.model("voucher", voucherSchema);