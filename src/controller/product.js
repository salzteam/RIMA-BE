const productsRepo = require("../repo/product");
const client = require("../config/redis");

const create = async (req, res) => {
  const result = await productsRepo.createProducts(req.body, req.file);
  res.status(result.statusCode).send(result);
};
const getProducts = async (req, res) => {
  const hostApi = `${req.protocol}://${req.hostname}`;
  const result = await productsRepo.getProducts(req.query, hostApi);
  res.status(result.statusCode).send(result);
};

const productsControllers = {
  create,
  getProducts,
};

module.exports = productsControllers;
