const profileRouter = require("express").Router();
const isLogin = require("../middlewares/isLogin");
const validate = require("../middlewares/validate");
const {
  diskUpload,
  memoryUpload,
  errorHandler,
} = require("../middlewares/upload");
const profileUploader = require("../middlewares/profileUpload");

const { editProfile, getProfile } = require("../controller/profile");

profileRouter.patch(
  "/edit",
  isLogin(),
  validate.body("name", "phone", "gender", "address"),
  (req, res, next) =>
    memoryUpload.single("image")(req, res, (err) => {
      errorHandler(err, res, next);
    }),
  profileUploader,
  validate.img(),
  editProfile
);
profileRouter.get("/:id", isLogin(), getProfile);
module.exports = profileRouter;
