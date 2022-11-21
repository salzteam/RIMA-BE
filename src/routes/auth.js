const authRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotUser,
} = require("../controller/auth");

authRouter.post(
  "/register",
  validate.email("email", "password", "role", "code", "username", "store_desc"),
  registerUser
);

authRouter.post(
  "/login",
  validate.email("emailOrusername", "password"),
  loginUser
);

authRouter.delete("/logout", isLogin(), logoutUser);
authRouter.patch(
  "/forgot",
  validate.body("email", "code", "new_password"),
  forgotUser
);

module.exports = authRouter;
