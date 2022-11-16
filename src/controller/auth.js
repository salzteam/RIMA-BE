const authRepo = require("../repo/auth");

const registerUser = async (req, res) => {
  const result = await authRepo.register(req.body);
  res.status(result.statusCode).send(result);
};
const loginUser = async (req, res) => {
  const result = await authRepo.login(req.body);
  res.status(result.statusCode).send(result);
};
const logoutUser = async (req, res) => {
  const result = await authRepo.logout(req.userPayload);
  res.status(result.statusCode).send(result);
};

const forgotUser = async (req, res) => {
  const result = await authRepo.reset(req.body);
  res.status(result.statusCode).send(result);
};

const authController = {
  registerUser,
  loginUser,
  logoutUser,
  forgotUser,
};

module.exports = authController;
