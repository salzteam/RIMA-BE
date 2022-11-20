const reviewsRepo = require("../repo/reviews");

const create = async (req, res) => {
  const result = await reviewsRepo.createReviews(req.body, req.userPayload);
  res.status(result.statusCode).send(result);
};
const drop = async (req, res) => {
  const result = await reviewsRepo.deleteReviews(req.params, req.userPayload);
  res.status(result.statusCode).send(result);
};
const get = async (req, res) => {
  //   const hostApi = `${req.protocol}://${req.hostname}:${process.env.PORT}`;
  const result = await reviewsRepo.getReviews(req.query);
  res.status(result.statusCode).send(result);
};

const reviewsController = {
  create,
  drop,
  get,
};

module.exports = reviewsController;
