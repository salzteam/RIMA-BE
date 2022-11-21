const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
} = require("../helpers/templateResponse");
const db = require("../config/database");

const createFavorite = (body, payload) => {
  return new Promise((resolve) => {
    const { product_id } = body;
    const query = "insert into favorite(product_id,user_id) values($1,$2)";
    db.query(query, [product_id, payload.user_id], (err, result) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      resolve(success(body));
    });
  });
};

const deleteFavorite = (params, userPayload) => {
  return new Promise((resolve) => {
    const query = "delete from favorite where id = $1 and user_id = $2";
    db.query(query, [params.id, userPayload.user_id], (err, result) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      resolve(success(`Delete Favorite Id.${params.id}`));
    });
  });
};
const getFavoriteId = (userPayload) => {
  return new Promise((resolve) => {
    const query = `select f.*,p."name",p.price ,p.description,p.users_id as seller_id, ui."name" as username, (select i.image from image i where product_id = p.id limit 1) as image from favorite f left join product p on f.product_id = p.id join userinfo ui on f.user_id = ui.user_id where f.user_id = ${userPayload.user_id}`;
    db.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      if (result.rows.length === 0) resolve(notFound());
      resolve(success(result.rows[0]));
    });
  });
};

const favoriteRepo = {
  createFavorite,
  deleteFavorite,
  getFavoriteId,
};

module.exports = favoriteRepo;
