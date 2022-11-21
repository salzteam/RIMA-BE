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
    const { name, phone, gender, address, store_desc } = body;
    let query = "update userinfo set ";
    const values = [];
    const userId = token.user_id;
    let imageProduct = "";
    let data = {};
    if (file) {
      imageProduct = file.url;
      if (!name && !phone && !address && !gender && !store_desc) {
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
const getProfile = (token) => {
  return new Promise((resolve, reject) => {
    const query = "select * from users where id = $1";
    const query2 = "select * from userinfo where user_id = $1";
    db.query(query, [token.user_id], (err, users) => {
      db.query(query2, [token.user_id], (err, profiles) => {
        if (err) {
          resolve(systemError());
        }
        const results = {
          profileData: users.rows,
          profileUser: profiles.rows,
        };
        resolve(success(results));
      });
    });
  });
};

const editPassword = (body, token) => {
  return new Promise((resolve, reject) => {
    const { password, new_password } = body;
    const getPwdQuery = "SELECT password FROM users WHERE id = $1";
    const getPwdValues = [token.user_id];
    db.query(getPwdQuery, getPwdValues, (err, response) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      const hashedPassword = response.rows[0].password;
      bcrypt.compare(password, hashedPassword, (err, isSame) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        if (!isSame) return resolve(custMsg("Password is wrong"));
        bcrypt.hash(new_password, 10, (err, newHashedPassword) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          const editPwdQuery =
            "UPDATE users SET password = $1, updated_at = now() WHERE id = $2";
          const editPwdValues = [newHashedPassword, token.user_id];
          db.query(editPwdQuery, editPwdValues, (err, response) => {
            if (err) {
              console.log(err);
              return resolve(systemError());
            }
            return resolve(success(null));
          });
        });
      });
    });
  });
};

const profileRepo = {
  editPorfile,
  getProfile,
  editPassword,
};

module.exports = profileRepo;
