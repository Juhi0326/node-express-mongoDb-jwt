const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  products: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number }
  }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullCharge: { type: Number, required: true, }
});

module.exports = mongoose.model('Order', orderSchema);
