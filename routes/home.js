const express = require("express");
const router = express.Router();
const multer = require('multer');
const moderatorAuthMiddleware = require('../middleware/authModerator');
const homeController = require('../controllers/home');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
  });
  
  const fileFilter =  (req, file, cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    //accept a file
    cb(null, true);
    } else {
    // reject a file
    cb(null, false);
    }
  };

const upload = multer({
    storage: storage, 
    limit: {fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter
});

router.get("/", homeController.homePage_get_all);

router.post("/", moderatorAuthMiddleware, upload.single('Picture'), homeController.homePage_create);

router.patch("/", moderatorAuthMiddleware, homeController.homePage_update);

router.delete("/", moderatorAuthMiddleware, homeController.homePage_delete);

module.exports = router;