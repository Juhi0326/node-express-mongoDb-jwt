const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  products: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String },
    price: { type: Number},
    quantity: { type: Number },
    storno: { type: Boolean, required: true}
  }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'orderStorno']
  },
  deliveryPrice: {
    type: Number,
    required: true,
  },
  fullCharge: {
    type: Number,
    required: true,
  },
  
  fullProductPrice: { type: Number, required: true, },
  accountAddress: 
      {
        postCode: { type: Number, required: true},
        Location: { type: String, required: true},
        street: { type: String, required: true},
        houseNUmber: { type: String, required: true},
        otherAddressData: String
      },
      deliveryAddress: 
      {
        postCode: { type: Number, required: true},
        Location: { type: String, required: true},
        street: { type: String, required: true},
        houseNUmber: { type: String, required: true},
        otherAddressData: String
      }
}, { timestamps: true }

);

module.exports = mongoose.model('Order', orderSchema);
