const favoriteRepo = require("../repo/favorite");

const create = async (req, res) => {
  const result = await favoriteRepo.createFavorite(req.body, req.userPayload);
  res.status(result.statusCode).send(result);
};
const get = async (req, res) => {
  const result = await favoriteRepo.getFavoriteId(req.userPayload);
  res.status(result.statusCode).send(result);
};
const drop = async (req, res) => {
  const result = await favoriteRepo.deleteFavorite(req.params, req.userPayload);
  res.status(result.statusCode).send(result);
};

const favoriteController = {
  create,
  get,
  drop,
};

module.exports = favoriteController;
