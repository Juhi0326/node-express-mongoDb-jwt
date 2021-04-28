const mongoose = require('mongoose');
const homePageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Title: { type: String},
    Heading: { type: String},
    Introduction : { type: String},
    Section_1: {type: String},
    Section_2: {type: String},
    Section_3: {type: String},
    Section_4: {type: String},
    Picture: {type: String}
});

module.exports = mongoose.model('HomePage', homePageSchema);