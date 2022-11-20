const reviewsRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
// const isAllowed = require("../middlewares/allowedRole");
const { create, drop, get } = require("../controller/reviews");
reviewsRouter.post(
  "/create",
  isLogin(),
  validate.body("product_id", "star", "message"),
  create
);
reviewsRouter.delete("/delete/:id", isLogin(), validate.params("id"), drop);
reviewsRouter.get("/", get);
module.exports = reviewsRouter;
