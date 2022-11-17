const profileRepo = require("../repo/profile");

const editProfile = async (req, res) => {
  const result = await profileRepo.editPorfile(
    req.body,
    req.userPayload,
    req.file
  );
  res.status(result.statusCode).send(result);
};

const profileControllers = {
  editProfile,
};

module.exports = profileControllers;
