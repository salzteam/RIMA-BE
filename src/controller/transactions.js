const transactionRepo = require("../repo/transaction");

const create = async (req, res) => {
  const result = await transactionRepo.createTransaction(
    req.body,
    req.userPayload
  );
  res.status(result.statusCode).send(result);
};
const getCust = async (req, res) => {
  const result = await transactionRepo.getTransactionCustomer(req.userPayload);
  res.status(result.statusCode).send(result);
};
const getSeller = async (req, res) => {
  const result = await transactionRepo.getTransactionCustomer(req.userPayload);
  res.status(result.statusCode).send(result);
};
const transactionController = {
  create,
  getCust,
  getSeller,
};

module.exports = transactionController;
