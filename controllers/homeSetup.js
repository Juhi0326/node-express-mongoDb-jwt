const HomePage = require('../models/homePage');
const mongoose = require('mongoose');
const Image = require('../models/image');
const fs = require('fs');
const PATH = require('path');
const image = require('../models/image');

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
            imageId: doc.imageId,
            Section_1: doc.Section_1,
            Section_2: doc.Section_2,
            Section_3: doc.Section_3,
            Section_4: doc.Section_4,
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

exports.homePage_create = (req, res, next) => {

  HomePage.find()
    .exec()
    .then((docs) => {
      if (docs.length > 0) {
        res.status(404).json({
          message:
            'csak egy home page lehetséges, ha már van egy, akkor csak módosítani lehet.',
        });
      } else {
        Image.findById(req.body.imageId).then((image) => {
          if (!image && req.body.imageId) {
            return res.status(404).json({
              message: 'Image not found',
            });
          }
          console.log(req.body);
          const homePage = new HomePage({
            _id: new mongoose.Types.ObjectId(),
            Title: req.body.Title,
            Heading: req.body.Heading,
            Introduction: req.body.Introduction,
            Section_1: req.body.Section_1,
            Section_2: req.body.Section_2,
            Section_3: req.body.Section_3,
            Section_4: req.body.Section_4,
            imageId: req.body.imageId,
            imageName:image.imageName
          });
          homePage
            .save()
            .then((result) => {
              console.log(result);
              res.status(201).json({
                message: 'Created new HomePage successfully!',
                createdHomePageData: {
                  Title: result.Title,
                  Heading: result.Heading,
                  Introduction: result.Introduction,
                  Section_1: result.Section_1,
                  Section_2: result.Section_2,
                  Section_3: result.Section_3,
                  Section_4: result.Section_4,
                  id: result._id,
                  imageId: result.imageId,
                  imageName: image.imageName,
                  request: {
                    type: 'GET',
                    url: 'http://localhost:8081/home',
                  },
                },
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                error: err,
              });
            });

        });

      }
    });
};

exports.homePage_update = (req, res, next) => {
  HomePage.find()
    .exec()
    .then((docs) => {
      if (docs.length < 0) {
        return res.status(404).json({
          message: 'Nincs még home page, hozz létre egyet.',
        });
      }
      const id = docs[0]._id;
      /*
          így kell lekérni postman-ből:
          [{'propName' : 'name', 'value': 'Mikrohullámú Sütő'}
        ]
          */
      let imageId = '';
      const updateOps = {};
      console.log(req.body);
      for (const ops of req.body) {
        if (ops.propName === 'imageId') {
          imageId = ops.value;
        }
        updateOps[ops.propName] = ops.value;
      }
      //check request image
      if (imageId !== '') {
        Image.findById(imageId).then((image) => {
          if (!image) {
            return res.status(404).json({
              message: 'Image not found',
            });
          }
        });
      }
      HomePage.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then((result) => {
          res.status(200).json({
            message: 'Home Page updated',
            request: {
              type: 'PATCH',
            },
          });
        })
        .catch((err) => {
          res.status(500).json({
            Error: err,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
};

exports.homePage_delete = (req, res, next) => {
  HomePage.find()
    .exec()
    .then((docs) => {
      if (docs.length < 0) {
        return res.status(404).json({
          message: 'Nincs még home page, így nem is lehet törölni.',
        });
      }
      const id = docs[0]._id;
      HomePage.deleteOne({ _id: id })
        .exec()
        .then((result) => {
          res.status(200).json({
            message: 'Home Page deleted successfully!',
            request: {
              type: 'DELETE',
              id: id,
            },
          });
        })
        .catch((err) => {
          res.status(500).json({
            Error: err,
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({
        Error: err,
      });
    });
};
