const authRouter = require("express").Router();
const validate = require("../middlewares/validate");
const { registerUser } = require("../controller/auth");

authRouter.post(
  "/register",
  validate.email("email", "password", "role"),
  registerUser
);

module.exports = authRouter;
