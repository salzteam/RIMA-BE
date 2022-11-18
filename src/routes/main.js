const express = require("express");
const mainRouter = express.Router();
const authRouter = require("./auth");
const profileRouter = require("./profile");
const productRouter = require("./product");
const prefix = "/api/v1";

mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.use(`${prefix}/profile`, profileRouter);
mainRouter.use(`${prefix}/product`, productRouter);

mainRouter.get("/", (req, res) => {
  res.json({
    msg: "This Is API from RIMA-Tech",
  });
});

module.exports = mainRouter;
