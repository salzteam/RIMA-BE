const authRepo = require("../repo/auth");

const registerUser = async (req, res) => {
  const result = await authRepo.register(req.body);
  res.status(result.statusCode).send(result);
};

const authController = {
  registerUser,
};

module.exports = authController;
