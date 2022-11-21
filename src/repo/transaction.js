const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
} = require("../helpers/templateResponse");
const db = require("../config/database");

const createTransaction = (body, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { product_id, promo_id, shipping_id, payment_id, qty, subtotal } =
        body;
      let promos = promo_id || null;
      const product = product_id.replace(/{/g, "").replace(/}/g, "");
      let productList = [];
      product.split(",").map((link) => productList.push(link));
      const qtty = qty.replace(/{/g, "").replace(/}/g, "");
      let quantyty = [];
      qtty.split(",").map((link) => quantyty.push(link));
      let queryProduct = `select ui."name" as seller_name, ui.user_id as seller_id , p.id, p."name" ,p.price, p.description, s."name" as size, c.color, i.image, s2.stock, c2."name" as category, b."name" as brand from product_size_color_image psci left join product p on psci.product_id = p.id join size s on psci.size_id = s.id join color c on psci.color_id = c.id join image i on psci.image_id = i.product_id join stock s2 on psci.stock_id = s2.product_id join category c2 on psci.category_id = c2.id join brand b on psci.brand_id = b.id join userinfo ui on p.users_id = ui.user_id where psci.product_id = $1`;
      let querycreateTransaction = `insert into transaction(user_id) values(${payload.user_id}) RETURNING id`;
      let queryCreateTP = `insert into transaction_product(transaction_id,product_id,qty,total,seller_id) values($1,$2,$3,$4,$5)`;
      let queryPivot = `insert into shipping_transaction_payment(transaction_id,transaction_product,promo_id,subtotal,shipping_id,payment_id) values($1,$2,$3,$4,$5,$6)`;
      let data = {
        product: [],
      };
      await db.query(querycreateTransaction, (err, result) => {
        if (err) {
          console.log(err.message);
          resolve(systemError());
        }
        const idTransaction = result.rows[0].id;
        data["id_transaction"] = idTransaction;
        data["username"] = payload.name;
        data["promo_id"] = promos;
        data["shipping_id"] = shipping_id;
        data["payment_id"] = payment_id;
        data["subtotal"] = subtotal;
        let count = 0;
        productList.forEach((element, index) => {
          count += 1;
          db.query(queryProduct, [element], (err, results) => {
            if (err) {
              console.log(err.message);
              resolve(systemError());
            }
            data.product.push({
              product_id: results.rows[0].id,
              product_name: results.rows[0].name,
              product_price: results.rows[0].name,
              product_seller_id: results.rows[0].seller_id,
              product_seller_name: results.rows[0].seller_name,
              quantity: quantyty[index],
              total:
                parseInt(quantyty[index]) * parseInt(results.rows[0].price),
            });
            const selectProduct = results.rows[0].id;
            const sellerName = results.rows[0].seller_id;
            const getTotal =
              parseInt(quantyty[index]) * parseInt(results.rows[0].price);
            let stock = results.rows[0].stock;
            let changeStock = parseInt(stock) - parseInt(quantyty[index]);
            db.query(
              queryCreateTP,
              [
                idTransaction,
                selectProduct,
                quantyty[index],
                getTotal,
                sellerName,
              ],
              (err, ResultTP) => {
                if (err) {
                  console.log(err.message);
                  resolve(systemError());
                }
                db.query(
                  `update stock set stock = ${changeStock} where product_id = ${selectProduct}`,
                  (err, resultupt) => {
                    if (err) {
                      console.log(err.message);
                      resolve(systemError());
                    }
                    if (count === productList.length + 1)
                      return resolve(success(data));
                  }
                );
              }
            );
            // resolve(success(result.rows));
          });
        });
        db.query(
          queryPivot,
          [
            idTransaction,
            idTransaction,
            promos,
            subtotal,
            shipping_id,
            payment_id,
          ],
          (err, resultPivot) => {
            if (err) {
              console.log(err.message);
              resolve(systemError());
            }
            count += 1;
          }
        );
      });
    } catch (error) {}
  });
};

const getTransactionCustomer = (params, payload) => {
  return new Promise((resolve, reject) => {
    let query = `select stp.* from shipping_transaction_payment stp left join transaction t on stp.transaction_id = t.id where t.user_id = $1`;
    let queryProduct = `select tp.* from shipping_transaction_payment stp left join transaction_product tp on stp.transaction_id  = tp.transaction_id join "transaction" t on stp.transaction_id = t.id where user_id = $1`;
    let data = {};
    if (params.filter) {
      if (params.filter === "1") {
        query += ` and stp.status_id = '1'`;
      }
      if (params.filter === "2") {
        query += ` and stp.status_id = '2'`;
      }
      if (params.filter === "3") {
        query += ` and stp.status_id = '3'`;
      }
      if (params.filter === "4") {
        query += ` and stp.status_id = '4'`;
      }
      if (params.filter === "5") {
        query += ` and stp.status_id = '5'`;
      }
      if (params.filter === "6") {
        query += ` and stp.status_id = '6'`;
      }
    }
    db.query(query, [payload.user_id], (err, result) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      if (result.rows.length === 0) return resolve(notFound());
      //   (data["transaction_id"] = result.rows[0].transaction_id),
      //     (data["transaction_product"] = result.rows[0].transaction_product),
      //     (data["promo_id"] = result.rows[0].promo_id),
      //     (data["subtotal"] = result.rows[0].subtotal),
      //     (data["shipping_id"] = result.rows[0].shipping_id),
      //     (data["status_id"] = result.rows[0].status_id),
      //     (data["payment_id"] = result.rows[0].payment_id),
      //     (data["product"] = []),
      db.query(queryProduct, [payload.user_id], (err, results) => {
        if (err) {
          console.log(err.message);
          resolve(systemError());
        }
        // data.product.push(results.rows),
        resolve(success(result.rows));
      });
    });
  });
};

const getTransactionSeller = (params, userPayload) => {
  return new Promise((resolve, reject) => {
    const query = `select stp.* from shipping_transaction_payment stp left join transaction t on stp.transaction_id = t.id join transaction_product tp on stp.transaction_id = tp.transaction_id where tp.seller_id = ${userPayload.user_id}`;
    const queryProduct = `select tp.* from shipping_transaction_payment stp left join transaction_product tp on stp.transaction_id  = tp.transaction_id join "transaction" t on stp.transaction_id = t.id`;
    let data = {};
    if (params.filter) {
      if (params.filter === "1") {
        query += ` and stp.status_id = '1'`;
      }
      if (params.filter === "2") {
        query += ` and stp.status_id = '2'`;
      }
      if (params.filter === "3") {
        query += ` and stp.status_id = '3'`;
      }
      if (params.filter === "4") {
        query += ` and stp.status_id = '4'`;
      }
      if (params.filter === "5") {
        query += ` and stp.status_id = '5'`;
      }
      if (params.filter === "6") {
        query += ` and stp.status_id = '6'`;
      }
    }
    db.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      //   (data["transaction_id"] = result.rows[0].transaction_id),
      //     (data["transaction_product"] = result.rows[0].transaction_product),
      //     (data["promo_id"] = result.rows[0].promo_id),
      //     (data["subtotal"] = result.rows[0].subtotal),
      //     (data["shipping_id"] = result.rows[0].shipping_id),
      //     (data["status_id"] = result.rows[0].status_id),
      //     (data["payment_id"] = result.rows[0].payment_id),
      //     (data["product"] = []),
      db.query(queryProduct, (err, results) => {
        if (err) {
          console.log(err.message);
          resolve(systemError());
        }
        // data.product.push(results.rows),
        resolve(success(result.rows));
      });
    });
  });
};

const getTransactionByStatus = (body, payload) => {
  return new Promise((resolve) => {
    const { transaction_id } = body;
    const query = `select stp.transaction_id , stp.status_id, p."name" from shipping_transaction_payment stp left join "transaction" t on stp.transaction_id = t.id join transaction_product tp on stp.transaction_product = tp.transaction_id join product p on tp.product_id = p.id where t.user_id = ${payload.user_id} and tp.transaction_id = ${transaction_id}`;
    let data = {};
    let nameProduct = [];
    db.query(query, (err, result) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      if (result.rows.length === 0) resolve(notFound());
      data["transaction_id"] = result.rows[0].transaction_id;
      data["status_id"] = result.rows[0].status_id;
      result.rows.map((names) => {
        nameProduct.push(names.name);
      });
      data = {
        transaction_id: result.rows[0].transaction_id,
        status_id: result.rows[0].status_id,
        name_product: nameProduct,
      };
      resolve(success(data));
    });
  });
};

const updateStatus = (body) => {
  return new Promise((resolve, reject) => {
    const { status_id, transaction_id } = body;
    const transactionQuery =
      "select * from transaction_product where transaction_id = $1";
    const stockQuery = "select stock from stock where product_id = $1";
    const updateStatus = `update shipping_transaction_payment set status_id = $1 where transaction_id = $2`;
    if (status_id === "6") {
      db.query(transactionQuery, [transaction_id], (err, resultTrans) => {
        if (err) {
          console.log(err.message);
          resolve(systemError());
        }
        const productList = resultTrans.rows;
        productList.map((data) => {
          db.query(stockQuery, [data.product_id], (err, resultStock) => {
            if (err) {
              console.log(err.message);
              resolve(systemError());
            }
            const oldStock = data.qty;
            const newStock =
              parseInt(oldStock) + parseInt(resultStock.rows[0].stock);
            db.query(
              `update stock set stock = ${newStock} where product_id = ${data.product_id}`,
              (err, resultUpdateStock) => {
                if (err) {
                  console.log(err.message);
                  resolve(systemError());
                }
                db.query(updateStatus, [status_id, transaction_id]);
                resolve(success());
              }
            );
          });
        });
      });
    }
    db.query(updateStatus, [status_id, transaction_id], (err, resultUpdt) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      resolve(success());
    });
  });
};

const transactionRepo = {
  createTransaction,
  getTransactionCustomer,
  getTransactionSeller,
  updateStatus,
  getTransactionByStatus,
};

module.exports = transactionRepo;
