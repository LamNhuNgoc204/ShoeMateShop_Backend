const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    

})

module.exports = mongoose.models.users || mongoose.model("user", userSchema);