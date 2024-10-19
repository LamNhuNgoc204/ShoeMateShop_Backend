const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'conversation',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'order',
    default: null
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [ 'notify', 'text', 'order'],
    default: 'text'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})


module.exports =
  mongoose.models.messages || mongoose.model("message", messageSchema);