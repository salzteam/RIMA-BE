const transactionRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
// const isAllowed = require("../middlewares/allowedRole");
const { create, getSeller, getCust } = require("../controller/transactions");
transactionRouter.post("/create", isLogin(), create);
transactionRouter.get("/", isLogin(), getCust);
transactionRouter.get("/seller", isLogin(), getSeller);
module.exports = transactionRouter;
