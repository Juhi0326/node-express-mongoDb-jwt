const mongoose = require('mongoose');
const homePageSchema2 = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Title: {
        titleDescription: { type: String },
        titleImagePath: { type: String }
    },
    Heading: {
        headingDescription: { type: String },
        headingImagePath: { type: String }
    },
    Introduction: {
        introductionDescription: { type: String } ,
        introductionImagePath: { type: String }
    },
    Section_1: {
        section_1Description: { type: String },
        section_1ImagePath: { type: String }
    },
    Section_2: {
        section_2Description: { type: String },
        section_2ImagePath: { type: String }
    },
    Section_3: {
        section_3Description: { type: String },
        section_3ImagePath: { type: String }
    },
    Section_4: {
        section_4Description: { type: String },
        section_4ImagePath: { type: String }
    },
    Section_5: {
        section_5Description: { type: String },
        section_5ImagePath: { type: String }
    },
    Section_6: {
        section_6Description: { type: String },
        section_6ImagePath: { type: String }
    },

});

module.exports = mongoose.model('HomePage2', homePageSchema2);
