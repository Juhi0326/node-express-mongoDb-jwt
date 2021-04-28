const multer = require('multer');



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
    
     upload = multer({
        storage: storage, 
        limit: {fileSize: 1024 * 1024 * 5},
        fileFilter: fileFilter
    });

  
    module.exports = {upload};


