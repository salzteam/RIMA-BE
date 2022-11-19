const productsRepo = require("../repo/product");
const client = require("../config/redis");

const create = async (req, res) => {
  const result = await productsRepo.createProducts(
    req.body,
    req.file,
    req.userPayload
  );
  res.status(result.statusCode).send(result);
};
const getProducts = async (req, res) => {
  const hostApi = `${req.protocol}://${req.hostname}`;
  const result = await productsRepo.getProducts(req.query, hostApi);
  res.status(result.statusCode).send(result);
};

// const edit = async (req, res) => {
//   const result = await productsRepo.editProducts(
//     req.body,
//     req.params,
//     req.file
//   );
//   res.status(result.statusCode).send(result);
// };

const drop = async (req, res) => {
  const result = await productsRepo.deleteProducts(req.params);
  res.status(result.statusCode).send(result);
};

const productsControllers = {
  create,
  getProducts,
  drop,
};

module.exports = productsControllers;
