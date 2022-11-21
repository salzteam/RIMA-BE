const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWTR = require("jwt-redis").default;
const db = require("../config/database");
const client = require("../config/redis");
const response = require("../helpers/response");
const jwtr = new JWTR(client);
const { sendVerifMail, sendMails } = require("../config/email");
const {
  success,
  systemError,
  created,
  emailreadyexsits,
  wrongData,
  userLogin,
  custMsg,
} = require("../helpers/templateResponse");

const register = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password, role, code, username, storedesc } = body;
    const validasiEmail = `select email from users where email like $1`;
    const store = storedesc || null;
    db.query(validasiEmail, [email], (err, resEmail) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      if (resEmail.rows.length > 0) {
        return resolve(emailreadyexsits());
      }
      if (email && !password && !role && !code && !username) {
        const digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        sendVerifMail({
          to: email,
          OTP: OTP,
          name: email,
        }).then((result) => {
          client.get(OTP).then((results) => {
            if (results) return resolve(custMsg("Code already send to email!"));
            client
              .set(OTP, email, {
                EX: 120,
                NX: true,
              })
              .then(() => {
                const data = {
                  message: "Link OTP send to email",
                  code: OTP,
                };
                return resolve(success(data));
              });
          });
          // });
        });
      }
      if (email && password && role && code && username) {
        client.get(code).then((results) => {
          if (!results || results !== email)
            return resolve(custMsg("Code OTP Wrong!"));
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
                "INSERT INTO userinfo (user_id, name ,phone, gender, address, store_desc) VALUES ($1,$2,$3,$4,$5,$6)",
                [result.rows[0].id, username, null, null, null, store],
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
                      username: body.username,
                    })
                  );
                }
              );
            });
          });
        });
      }
    });
  });
};

const login = (body) => {
  return new Promise((resolve, reject) => {
    const { emailOrusername, password, isEmail } = body;
    let getPasswordByEmailQuery =
      "SELECT u.id, u.password, u.role, ui.name FROM users u left join userinfo ui on u.id = ui.user_id WHERE email = $1";
    if (!isEmail)
      getPasswordByEmailQuery = `SELECT us.id, us.password, us.role, u.name FROM users us left join userinfo u on us.id = u.user_id WHERE u.name = $1`;
    const getPasswordByEmailValues = [emailOrusername];
    db.query(
      getPasswordByEmailQuery,
      getPasswordByEmailValues,
      (err, response) => {
        if (err) {
          console.log(err);
          return resolve(wrongData());
        }
        if (response.rows.length === 0) return resolve(wrongData());
        const hashedPassword = response.rows[0].password;
        bcrypt.compare(password, hashedPassword, (err, isSame) => {
          if (err) {
            console.log(err);
            return resolve(wrongData());
          }
          if (!isSame) return resolve(wrongData());
          const payload = {
            user_id: response.rows[0].id,
            name: response.rows[0].name,
            role: response.rows[0].role,
            emailOrusername,
          };
          jwtr
            .sign(payload, process.env.SECRET_KEY, {
              expiresIn: "1d",
              issuer: process.env.ISSUER,
            })
            .then((token) => {
              console.log(payload);
              const sendRespon = {
                token: token,
                name: payload.name,
                emailOrusername: payload.emailOrusername,
                id: response.rows[0].id,
                role: response.rows[0].role,
              };
              return resolve(userLogin(sendRespon));
            });
        });
      }
    );
  });
};

const logout = (token) => {
  return new Promise((resolve, reject) => {
    const jwtr = new JWTR(client);
    jwtr.destroy(token.jti).then((res) => {
      if (!res) resolve(unauthorized());
      resolve(success("Success logout account"));
    });
  });
};

const reset = (body) => {
  return new Promise((resolve, reject) => {
    const { code, new_password, email } = body;
    if (email) {
      if (!code && !new_password) {
        let queryEmail =
          "select us.id, us.email, u.name from users us left join userinfo u on us.id = u.user_id where email = $1";
        db.query(queryEmail, [email], (err, resEmail) => {
          if (err) {
            console.log(err.message);
            resolve(systemError());
          }
          if (resEmail.rows.length == 0) return resolve(wrongData());
          const digits = "0123456789";
          let OTP = "";
          for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
          }
          //   console.log(resEmail.rows[0].name);
          const sendName = resEmail.rows[0].name || null;
          sendMails({
            to: email,
            OTP: OTP,
            name: sendName,
          }).then((result) => {
            client.get(OTP).then((results) => {
              if (results)
                return resolve(custMsg("Code already send to email!"));
              client
                .set(OTP, email, {
                  EX: 120,
                  NX: true,
                })
                .then(() => {
                  const data = {
                    message: "Link OTP send to email",
                    code: OTP,
                  };
                  resolve(success(data));
                });
            });
            // });
          });
        });
      }
    }
    if (code && new_password && email) {
      client.get(code).then((results) => {
        if (!results || results !== email)
          return resolve(custMsg("Code OTP Wrong!"));
        bcrypt.hash(new_password, 10, (err, newHashedPassword) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          const editPwdQuery =
            "UPDATE users SET password = $1, updated_at = now() WHERE email = $2";
          const editPwdValues = [newHashedPassword, results];
          db.query(editPwdQuery, editPwdValues, (err, response) => {
            if (err) {
              console.log(err);
              return resolve(systemError());
            }
            resolve(success(null));
            client.del(code).then(() => {
              return client.del(results).then();
            });
          });
        });
      });
    }
  });
};

const authRepo = {
  register,
  login,
  logout,
  reset,
};

module.exports = authRepo;
