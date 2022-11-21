const transactionRepo = require("../repo/transaction");

const create = async (req, res) => {
  const result = await transactionRepo.createTransaction(
    req.body,
    req.userPayload
  );
  res.status(result.statusCode).send(result);
};
const getCust = async (req, res) => {
  console.log(req.query);
  const result = await transactionRepo.getTransactionCustomer(
    req.query,
    req.userPayload
  );
  res.status(result.statusCode).send(result);
};
const getSeller = async (req, res) => {
  const result = await transactionRepo.getTransactionSeller(
    req.query,
    req.userPayload
  );
  res.status(result.statusCode).send(result);
};
const getByStatus = async (req, res) => {
  const result = await transactionRepo.getTransactionByStatus(
    req.body,
    req.userPayload
  );
  res.status(result.statusCode).send(result);
};
const updateStatus = async (req, res) => {
  const result = await transactionRepo.updateStatus(req.body);
  res.status(result.statusCode).send(result);
};
const transactionController = {
  create,
  getCust,
  getSeller,
  updateStatus,
  getByStatus,
};

module.exports = transactionController;
