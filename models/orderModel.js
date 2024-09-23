const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({

})

module.exports = mongoose.models.orders || mongoose.model("order", orderSchema);