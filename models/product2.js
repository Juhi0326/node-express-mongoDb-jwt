const mongoose = require('mongoose');
const product2Schema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  discountPercentage: {type: Number, required: true},
  description: { type: String, required: true },
  imagePath: { type: String, required: true },
}, { timestamps: true }
)
module.exports = mongoose.model('Product2', product2Schema);
