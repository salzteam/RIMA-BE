const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
  custMsg,
} = require("../helpers/templateResponse");
const db = require("../config/database");

const createPromo = (body) => {
  return new Promise((resolve, reject) => {
    let { code, discount } = body;
    const query =
      "insert into promo (code, discount) values ($1,$2) RETURNING id";
    db.query(query, [code, discount], (err, queryResult) => {
      if (err) {
        if (
          err.message ===
          `duplicate key value violates unique constraint "Promo_code_key"`
        )
          return resolve(custMsg("Cupon Name Already Exist"));
        console.log(err);
        return resolve(systemError());
      }
      resolve(
        created({
          id: queryResult.rows[0].id,
          Code: code,
          Discount: discount,
        })
      );
    });
  });
};

const deletePromo = (params) => {
  return new Promise((resolve, reject) => {
    const query = "delete from promo where id = $1";
    db.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      resolve(success(`Success delete promo id.${params.id}`));
    });
  });
};

const editPromo = (body, params) => {
  return new Promise((resolve, reject) => {
    let { code, discount } = body;
    let query = "update promo set ";
    const values = [];
    let data = {
      id: params.id,
    };
    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += `${key} = $${idx + 1}, updated_at = now() where id = $${
          idx + 2
        }`;
        values.push(body[key], params.id);
        data[key] = body[key];
        return;
      }
      query += `${key} = $${idx + 1},`;
      data[key] = body[key];
      values.push(body[key]);
    });
    db.query(query, values)
      .then((response) => {
        return resolve(success(data));
      })
      .catch((err) => {
        if (
          err.message ===
          `duplicate key value violates unique constraint "Promo_code_key"`
        )
          return resolve(custMsg("Cupon Name Already Exist"));
        console.log(err);
        resolve(systemError());
      });
  });
};

const getPromo = (queryParams, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = `${hostApi}/api/v1/promo?`;
    let query = `select id, code, discount from promo`;
    let queryLimit = "";
    if (queryParams.search) {
      query += ` where lower(p.product_name) like lower('%${queryParams.search}%')`;
      link += `search=${queryParams.search}&`;
    }
    // PAGINASI
    let values = [];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      queryLimit = query + ` limit $1 offset $2`;
      values.push(limit, offset);
    } else {
      queryLimit = query;
    }
    db.query(query, (err, getData) => {
      db.query(queryLimit, values, (err, result) => {
        if (err) {
          console.log(err);
          return resolve(systemError());
        }
        if (result.rows.length == 0) return resolve(notFound());
        let resNext = null;
        let resPrev = null;
        if (queryParams.page && queryParams.limit) {
          let page = parseInt(queryParams.page);
          let limit = parseInt(queryParams.limit);
          let start = (page - 1) * limit;
          let end = page * limit;
          let dataNext = Math.ceil(getData.rowCount / limit);
          if (start <= getData.rowCount) {
            next = page + 1;
          }
          if (end > 0) {
            prev = page - 1;
          }
          if (parseInt(next) <= parseInt(dataNext)) {
            resNext = `${link}page=${next}&limit=${limit}`;
          }
          if (parseInt(prev) !== 0) {
            resPrev = `${link}page=${prev}&limit=${limit}`;
          }
          let sendResponse = {
            dataCount: getData.rows.length,
            next: resNext,
            prev: resPrev,
            totalPage: dataNext,
            data: result.rows,
          };
          return resolve(success(sendResponse));
        }
        let sendResponse = {
          dataCount: getData.rows.length,
          next: resNext,
          prev: resPrev,
          totalPage: null,
          data: result.rows,
        };
        return resolve(success(sendResponse));
      });
    });
  });
};

const getPromoId = (params) => {
  return new Promise((resolve, reject) => {
    let query = `select * from promo where id = $1`;
    db.query(query, [params.id], (err, result) => {
      if (err) {
        console.log(err);
        return resolve(systemError());
      }
      resolve(success(result.rows));
    });
  });
};

const promoRepo = {
  createPromo,
  deletePromo,
  editPromo,
  getPromo,
  getPromoId,
};

module.exports = promoRepo;
