const promoRepo = require("../repo/promo");

const create = async (req, res) => {
  const result = await promoRepo.createPromo(req.body);
  res.status(result.statusCode).send(result);
};
const drop = async (req, res) => {
  const result = await promoRepo.deletePromo(req.params);
  res.status(result.statusCode).send(result);
};
const edit = async (req, res) => {
  const result = await promoRepo.editPromo(req.body, req.params);
  res.status(result.statusCode).send(result);
};
const get = async (req, res) => {
  const hostApi = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
  const result = await promoRepo.getPromo(req.query, hostApi);
  res.status(result.statusCode).send(result);
};
const getid = async (req, res) => {
  const result = await promoRepo.getPromoId(req.params);
  res.status(result.statusCode).send(result);
};
const promoControllers = {
  create,
  drop,
  edit,
  get,
  getid,
};

module.exports = promoControllers;
