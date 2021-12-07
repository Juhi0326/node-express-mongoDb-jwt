const HomePage2 = require('../models/homePage2');
const mongoose = require('mongoose');
const fs = require("fs");
const PATH = require("path");
const { deleteImageFromServer } = require('../modules/services/imageService');

//a képet így lehet elérni: http://localhost:8081/uploads/1620145209368sky.jpg

exports.homePage2_get_all = (req, res, next) => {
    HomePage2.find()
        .select('-_v')
        .exec()
        .then((docs) => {
            console.log(docs[0]);
            const response = {
                count: docs.length,
                HomePage: docs.map((doc) => {
                    return {
                        Title: doc.Title,
                        Heading: doc.Heading,
                        Introduction: doc.Introduction,
                        Section_1: doc.Section_1,
                        Section_2: doc.Section_2,
                        Section_3: doc.Section_3,
                        Section_4: doc.Section_4,
                        imageId: doc.imageId,
                        imagePath: doc.imagePath,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                        },
                    };
                }),
            };
            res.status(200).json(response);
        })
        .catch((err) => {
            res.status(500).json({
                Error: err,
            });
        });
};

exports.homePage2_create = (req, res, next) => {
    console.log(req.body)
    HomePage2.find()
        .exec()
        .then((docs) => {
            if (docs.length > 0) {
                res.status(404).json({
                    message:
                        "csak egy home page lehetséges, ha már van egy, akkor csak módosítani lehet.",
                });
            } else {
                try {
                    const homePage = new HomePage2({
                        _id: new mongoose.Types.ObjectId(),
                        Title: {
                            titleDescription: req.body.Title,
                            titleImagePath: req.file.path
                        },
                        Heading: {
                            headingDescription: req.body.Heading,
                        },
                        Introduction: {
                            introductionDescription: req.body.Introduction,
                        },
                        Section_1: {
                            section_1Description: req.body.Section_1,
                        },
                        Section_2: {
                            section_2Description: req.body.Section_2,
                        },
                        Section_3: {
                            section_3Description: req.body.Section_3,
                        },
                        Section_4: {
                            section_4Description: req.body.Section_4,
                        },
                        Section_5: {
                            section_5Description: req.body.Section_5,
                        },
                        Section_6: {
                            section_6Description: req.body.Section_6,
                        },
                    });
                    homePage
                        .save()
                        .then((result) => {
                            console.log(result);
                            res.status(201).json({
                                message: "Created new HomePage successfully!",
                                request: {
                                    type: "GET",
                                    url: "http://localhost:8081/home",
                                },
                            },
                            );
                        }).catch((err) => {
                            throw new ErrorÍ(error)
                        })

                } catch (error) {
                    throw new Error(error)
                }
            }
        }).catch((err) => {
            res.status(500).json({
                Error: err.message,
            });
        })
}

exports.homePage2_TitleChange = (req, res, next) => {
    let oldImage = null
    HomePage2.find()
        .select('-_v')
        .exec()
        .then((docs) => {
            const homePage = docs[0]
            const id = docs[0]._id
            let updateOps = { Title: { titleDescription: docs[0]._doc.Title.titleDescription, titleImagePath: docs[0]._doc.Title.titleImagePath } }
            if (req.file) {
                oldImage = docs[0]._doc.Title.titleImagePath
                updateOps.Title.titleImagePath = req.file.path
            }
            if (req.body.Title) {
                updateOps.Title.titleDescription = req.body.Title
            }
            console.log(updateOps)
            HomePage2.updateOne({ _id: id }, { $set: updateOps })
                .exec()
                .then(() => {
                    if (oldImage) {
                        deleteImageFromServer(oldImage)
                    }
                    res.status(200).json({
                        message: 'Home page Title is updated',
                    })
                }).catch((err) => {
                    throw new Error(err)
                })
        })
        .catch((err) => {
            res.status(500).json({
                Error: err,
            });
        });
};

exports.homePage2_HeadingChange = (req, res, next) => {
    let oldImage = null
    HomePage2.find()
        .select('-_v')
        .exec()
        .then((docs) => {
            const homePage = docs[0]
            const id = docs[0]._id
            let updateOps = { Heading: { headingDescription: docs[0]._doc.Heading.headingDescription, headingImagePath: docs[0]._doc.Heading.headingImagePath } }
            if (req.file) {
                oldImage = docs[0]._doc.Heading.headingImagePath
                updateOps.Heading.headingImagePath = req.file.path
            }
            if (req.body.Heading) {
                updateOps.Heading.headingDescription = req.body.Title
            }
            console.log(updateOps)
            HomePage2.updateOne({ _id: id }, { $set: updateOps })
                .exec()
                .then(() => {
                    if (oldImage) {
                        deleteImageFromServer(oldImage)
                    }
                    res.status(200).json({
                        message: 'Home page Heading is updated',
                    })
                }).catch((err) => {
                    throw new Error(err)
                })
        })
        .catch((err) => {
            res.status(500).json({
                Error: err,
            });
        });
};