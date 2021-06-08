const HomePage = require('../models/homePage');
const mongoose = require('mongoose');

//a képet így lehet elérni: http://localhost:8081/uploads/1620145209368sky.jpg

exports.homePage_get_all = (req, res, next) => {
  HomePage.find()
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
            imageName: doc.imageName,
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
