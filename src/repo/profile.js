const bcrypt = require("bcrypt");
const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
  emailreadyexsits,
  datareadyexsits,
  custMsg,
  phonealreadyexsits,
} = require("../helpers/templateResponse");
const db = require("../config/database");

const editPorfile = (body, token, file) => {
  return new Promise((resolve, reject) => {
    const { name, phone, gender, address } = body;
    let query = "update userinfo set ";
    const values = [];
    const userId = token.user_id;
    let imageProduct = "";
    let data = {};
    if (file) {
      imageProduct = file.url;
      if (!name && !phone && !address && !gender) {
        if (file && file.resource_type == "image") {
          query += `image = '${imageProduct}',updated_at = now() where user_id = $1`;
          values.push(userId);
          data["image"] = imageProduct;
        }
      } else {
        if (file && file.resource_type == "image") {
          query += `image = '${imageProduct}',`;
          data["image"] = imageProduct;
        }
      }
    }
    const getData = "select * from userinfo where user_id = $1";
    db.query(getData, [userId], (err, resData) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      if (resData.rows.length < 1) {
        return resolve(notFound());
      }
      Object.keys(body).forEach((key, idx, array) => {
        if (key == "image") key = "displaypicture";
        if (idx === array.length - 1) {
          query += `${key} = $${idx + 1},updated_at = now() where user_id = $${
            idx + 2
          }`;
          values.push(body[key], userId);
          data[key] = body[key];
          return;
        }
        query += `${key} = $${idx + 1},`;
        values.push(body[key]);
        data[key] = body[key];
      });
      //   console.log(query);
      db.query(query, values)
        .then((response) => {
          resolve(success(data));
        })
        .catch((err) => {
          console.log(err);
          resolve(systemError());
        });
    });
  });
};

const profileRepo = {
  editPorfile,
};

module.exports = profileRepo;
