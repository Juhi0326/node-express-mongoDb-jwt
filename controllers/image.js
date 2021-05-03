const Image = require('../models/image');
const mongoose = require('mongoose');
const fs = require('fs');
const PATH = require('path');

exports.images_get_all = (req, res, next) => {
  Image.find()
    .select('-_v')
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        images: docs.map((doc) => {
          return {
            name: doc.name,
            imageName: doc.imageName,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:8081/image-setup/' + doc._id,
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

exports.image_create = (req, res, next) => {
  console.log(req.file);
  const image = new Image({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    imageName: req.file.path,
  });
  image
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'Created new image successfully!',
        createdImage: {
          name: result.name,
          imageName: result.imageName,
          id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:8081/image-setup/' + result._id,
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
};

exports.image_get_one_ById = (req, res, next) => {
  const id = req.params.imageId;
  Image.findById(id)
    .select('-__v')
    .exec()
    .then((doc) => {
      if (doc) {
        console.log(doc);
        res.status(200).json({
          image: doc,
          request: {
            type: 'GET',
            url: 'http://localhost:8081/image-setup',
          },
        });
      } else {
        res.status(404).json({
          message: 'There is not an image with this id!',
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
};

exports.image_delete_byId = (req, res, next) => {
  const id = req.params.imageId;
  const pathFile = PATH.resolve('');
  Image.findById(id)
    .exec()
    .then((image) => {
      if (!image) {
        return res.status(404).json({
          messages: 'there is not an image with this id!',
        });
      } else {
        fs.unlink(pathFile + '\\' + image.imageName, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('sikerült!');
          }
        });

        Image.deleteOne({ _id: id })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: 'image deleted successfully!',
              request: {
                type: 'DELETE',
                url: 'http://localhost:8081/image-setup',
                body: { name: image.name, imageName: image.imageName },
                id: id,
              },
            });
          })
          .catch((err) => {
            res.status(500).json({
              Error: err,
            });
          });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        Error: err,
      });
    });
};
