const mongoose = require('mongoose')
const paymentSchema = new mongoose.Schema({

})

module.exports = mongoose.models.payments || mongoose.model("payment", paymentSchema);