const Image = require("../models/image");
const mongoose = require("mongoose");
const fs = require("fs");
const PATH = require("path");
const Product = require("../models/product");
const HomePage = require("../models/homePage");

exports.images_get_all = (req, res, next) => {
  Image.find()
    .select("-_v")
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
              type: "GET",
              url: "http://localhost:8081/image-setup/" + doc._id,
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
  const image = new Image({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    imageName: req.file.path,
  });
  image
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Created new image successfully!",
        createdImage: {
          name: result.name,
          imageName: result.imageName,
          id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:8081/image-setup/" + result._id,
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
    .select("-__v")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          image: doc,
          request: {
            type: "GET",
            url: "http://localhost:8081/image-setup",
          },
        });
      } else {
        res.status(404).json({
          message: "There is not an image with this id!",
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
  let productArray = [];
  let homePageArray = [];
  const id = req.params.imageId;
  const pathFile = PATH.resolve("");

  try {
    Product.find()
      .exec()
      .then((products) => {
        products.forEach((product) => {
          if (product.imageId == id) {
            productArray.push(product);
          }
        });
      });
  } catch (error) {
    console.log(error);
  }

  try {
    HomePage.find()
      .exec()
      .then((homePages) => {
        homePages.forEach((homePage) => {
          if (homePage.imageId == id) {
            homePageArray.push(homePage);
          }
        });
      });
  } catch (error) {
    console.log(error);
  }

  Image.findById(id)
    .exec()
    .then((image) => {
      console.log(homePageArray);
      console.log(productArray);
      if (!image) {
        return res.status(404).json({
          messages: "there is not an image with this id!",
        });
      }
      if (productArray.length > 0 && !homePageArray.length) {
        return res.status(404).json({
          message: `van ilyen kép termékhez társítva, ha törölni szeretnéd a képet, 
            akkor előszőr a terméket kell törölni.`,
          termék: productArray,
        });
      } else if (homePageArray.length > 0 && productArray.length <= 0) {
        return res.status(404).json({
          message: `van ilyen kép a home Page-hez társítva, ha törölni szeretnéd a képet, 
            akkor előszőr a home page-et kell törölni, vagy cserélni a képet.`,
          homePage: homePageArray,
        });
      } else if (homePageArray.length > 0 && productArray.length > 0) {
        return res.status(404).json({
          message: `van ilyen kép a home page-en is, és a product-nál is.`,
          termék: productArray,
          homePage: homePageArray,
        });
      } else {
        fs.unlink(pathFile + "\\" + image.imageName, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("image deleted from the server successfully!");
          }
        });
        Image.deleteOne({ _id: id })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: "image deleted successfully!",
              request: {
                type: "DELETE",
                url: "http://localhost:8081/image-setup",
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
    });
};
