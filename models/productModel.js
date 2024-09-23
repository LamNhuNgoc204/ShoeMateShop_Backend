const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({

})

module.exports = mongoose.models.products || mongoose.model("product", productSchema);