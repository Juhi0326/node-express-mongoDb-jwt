const fs = require("fs");
const PATH = require("path");

const deleteImageFromServer = (imagePath) => {
    const pathFile = PATH.resolve("");
    console.log(pathFile + "\\" + imagePath)
    fs.unlink(pathFile + "\\" + imagePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("image deleted from the server successfully!");
        }
      });
}
module.exports = { deleteImageFromServer }