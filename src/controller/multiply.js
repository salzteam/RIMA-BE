const util = require("util");

const { memoryUpload } = require("../middlewares/upload");

const uploadFiles = memoryUpload.array("image", 6);
const uploadFilesMiddleware = util.promisify(uploadFiles);

const multipleUpload = async (req, res, next) => {
  try {
    const upload = await uploadFilesMiddleware(req, res);
    console.log(uploadFiles);
    // next();
    return res.send(`Files has been uploaded.`);
  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};

module.exports = {
  multipleUpload: multipleUpload,
};
