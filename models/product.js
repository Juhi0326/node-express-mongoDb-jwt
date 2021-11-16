const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  discountPercentage: {type: Number},
  description: { type: String, required: true },
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
  },
  imagePath: {type: String, required: true },
}, { timestamps: true }
)
module.exports = mongoose.model('Product', productSchema);
