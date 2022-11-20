const productsRouter = require("express").Router();
const validate = require("../middlewares/validate");
const isLogin = require("../middlewares/isLogin");
const isAllowed = require("../middlewares/allowedRole");
const {
  create,
  getProducts,
  drop,
  getProductsbyId,
  getProductBySeller,
} = require("../controller/product");
const {
  diskUpload,
  memoryUpload,
  errorHandler,
} = require("../middlewares/upload");
const productUpload = require("../middlewares/productUpload");

productsRouter.post(
  "/create",
  isLogin(),
  isAllowed("seller"),
  validate.body(
    "name",
    "price",
    "category_id",
    "brand_id",
    "stock",
    "size_id",
    "color_id",
    "desc"
  ),
  (req, res, next) =>
    memoryUpload.array("image", 5)(req, res, (err) => {
      errorHandler(err, res, next);
    }),
  productUpload,
  validate.imgs(),
  create
);
// productsRouter.patch(
//   "/edit/:id",
//   isLogin(),
//   validate.params("id"),
//   validate.body(
//     "name",
//     "price",
//     "category_id",
//     "brand_id",
//     "stock",
//     "size_id",
//     "color_id",
//     "desc"
//   ),
//   (req, res, next) =>
//     memoryUpload.array("image", 5)(req, res, (err) => {
//       errorHandler(err, res, next);
//     }),
//   productUpload,
//   validate.img(),
//   edit
// );
productsRouter.delete(
  "/delete/:id",
  isLogin(),
  isAllowed("seller"),
  validate.params("id"),
  drop
);
productsRouter.get("/", getProducts);
productsRouter.get(
  "/my-product",
  isLogin(),
  isAllowed("seller"),
  getProductBySeller
);
productsRouter.get("/:id", getProductsbyId);
module.exports = productsRouter;
