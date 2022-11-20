const transactionRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const {
  create,
  getSeller,
  getCust,
  updateStatus,
} = require("../controller/transactions");
transactionRouter.post("/create", isLogin(), isAllowed("seller"), create);
transactionRouter.get("/", isLogin(), isAllowed("customer"), getCust);
transactionRouter.get("/seller", isLogin(), isAllowed("seller"), getSeller);
transactionRouter.patch(
  "/update-status",
  isLogin(),
  isAllowed("seller"),
  updateStatus
);
module.exports = transactionRouter;
