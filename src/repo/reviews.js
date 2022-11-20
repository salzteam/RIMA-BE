const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
  custMsg,
} = require("../helpers/templateResponse");
const db = require("../config/database");

const createReviews = (body, payload) => {
  return new Promise((resolve, reject) => {
    let { product_id, star, message } = body;
    console.log(body);
    const query =
      "insert into reviews (product_id, user_id, star, message) values ($1,$2,$3,$4)";
    db.query(
      query,
      [product_id, payload.user_id, star, message],
      (err, queryResult) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        resolve(
          created({
            user_id: payload.user_id,
            product_id: product_id,
            star: star,
            message: message,
          })
        );
      }
    );
  });
};

const getReviews = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select p.name as product_name,p.price as product_price,p.description as product_description,ui.name as username,r.star,r.message,r.created_at from reviews r left join product p on r.product_id = p.id join userinfo ui on r.user_id = ui.user_id";
    db.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      resolve(success(result.rows));
    });
  });
};

const deleteReviews = (params, payload) => {
  return new Promise((resolve, reject) => {
    const query = "delete from reviews where id = $1";
    db.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      resolve(success(`Success delete Reviews id.${params.id}`));
    });
  });
};

const reviewsRepo = {
  createReviews,
  deleteReviews,
  getReviews,
};

module.exports = reviewsRepo;
