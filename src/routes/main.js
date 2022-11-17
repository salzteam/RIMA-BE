const express = require("express");

const mainRouter = express.Router();
const authRouter = require("./auth");
const profileRouter = require("./profile");
const prefix = "/api/v1";

mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.use(`${prefix}/profile`, profileRouter);

mainRouter.get("/", (req, res) => {
  res.json({
    msg: "This Is API from RIMA-Tech",
  });
});

module.exports = mainRouter;
