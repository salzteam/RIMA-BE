const transactionRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const {
  create,
  getSeller,
  getCust,
  updateStatus,
  getByStatus,
} = require("../controller/transactions");
transactionRouter.post(
  "/create",
  isLogin(),
  isAllowed("customer"),
  validate.body(
    "product_id",
    "promo_id",
    "shipping_id",
    "payment_id",
    "qty",
    "subtotal"
  ),
  create
);
transactionRouter.get("/", isLogin(), isAllowed("customer"), getCust);
transactionRouter.get(
  "/history-seller",
  isLogin(),
  isAllowed("seller"),
  getSeller
);
transactionRouter.get("/status", isLogin(), isAllowed("customer"), getByStatus);
transactionRouter.patch(
  "/update-status",
  isLogin(),
  isAllowed("seller"),
  updateStatus
);
module.exports = transactionRouter;
