var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const conversationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        require: true,
    },
    staffId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
})


module.exports =
  mongoose.models.conversations || mongoose.model("conversation", conversationSchema);