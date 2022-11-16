const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWTR = require("jwt-redis").default;
const db = require("../config/database");
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

const register = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password, role } = body;
    const validasiEmail = `select email from users where email like $1`;
    db.query(validasiEmail, [email], (err, resEmail) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      if (resEmail.rows.length > 0) {
        return resolve(emailreadyexsits());
      }
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        const query =
          "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id";
        const values = [email, hashedPassword, role];
        db.query(query, values, (err, result) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          db.query(
            "INSERT INTO userinfo (user_id, name ,phone, gender, address) VALUES ($1,$2,$3,$4,$5)",
            [result.rows[0].id, null, null, null, null],
            (err, response) => {
              if (err) {
                console.log(err);
                db.query(
                  "delete from user where id = $1",
                  [result.rows[0].id],
                  (err, res) => {
                    if (err) console.log(err);
                  }
                );
                return resolve(systemError());
              }
              return resolve(
                created({
                  ...result.rows[0],
                  email: body.email,
                  role: body.role,
                })
              );
            }
          );
        });
      });
    });
  });
};

const authRepo = {
  register,
};

module.exports = authRepo;
