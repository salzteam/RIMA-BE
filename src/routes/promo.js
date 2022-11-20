const promoRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
// const isAllowed = require("../middlewares/allowedRole");
const { create, drop, get, edit, getid } = require("../controller/promo");
promoRouter.post(
  "/create",
  isLogin(),
  validate.body("code", "discount"),
  create
);
promoRouter.patch(
  "/edit/:id",
  isLogin(),
  validate.params("id"),
  validate.body("code", "discount"),
  edit
);
promoRouter.delete("/delete/:id", isLogin(), validate.params("id"), drop);
promoRouter.get("/", get);
promoRouter.get("/:id", getid);
module.exports = promoRouter;
