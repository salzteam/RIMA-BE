const favoriteRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const { create, get, drop } = require("../controller/favorite");

favoriteRouter.post(
  "/add",
  isLogin(),
  isAllowed("customer"),
  validate.body("product_id"),
  create
);
favoriteRouter.get("/my-favorite", isLogin(), isAllowed("customer"), get);
favoriteRouter.delete("/remove/:id", isLogin(), isAllowed("customer"), drop);

module.exports = favoriteRouter;
