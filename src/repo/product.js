const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
  invalidParameter,
  custMsg,
} = require("../helpers/templateResponse");
const db = require("../config/database");
const { image } = require("../config/cloudinary");

const createProducts = (body, file, user) => {
  return new Promise((resolve, reject) => {
    db.connect((err, client, done) => {
      const shouldAbort = (err) => {
        if (err) {
          console.error("Error in Created", err.stack);
          resolve(invalidParameter());
          client.query("ROLLBACK", (err) => {
            if (err) {
              console.log(systemError(err.stack));
              resolve(systemError(err.stack));
            }
            done();
          });
        }
        return !!err;
      };
      client.query("BEGIN", (err) => {
        if (shouldAbort(err)) return;
        let {
          name,
          price,
          category_id,
          brand_id,
          stock,
          size_id,
          color_id,
          desc,
        } = body;
        if (shouldAbort(err)) return;
        const queryText =
          "insert into product (name, price, description, users_id) values ($1,$2,$3,$4) RETURNING id";
        client.query(
          queryText,
          [name, price, desc, user.user_id],
          (err, res) => {
            if (shouldAbort(err)) return;
            const productID = res.rows[0].id;
            let inputImage =
              "insert into image (product_id, image) values ($1,$2)";
            file.forEach((elemen, indext) => {
              client.query(inputImage, [productID, elemen], (err, resImage) => {
                if (shouldAbort(err)) return;
              });
            });
            let inputStock = "insert into stock(product_id,stock)values($1,$2)";
            client.query(inputStock, [productID, stock], (err, resStock) => {
              if (shouldAbort(err)) return;
              const insertPivot =
                "insert into product_size_color_image (product_id, size_id, color_id, image_id, stock_id, category_id, brand_id) values ($1,$2,$3,$4,$5,$6,$7)";
              client.query(
                insertPivot,
                [
                  productID,
                  size_id,
                  color_id,
                  productID,
                  productID,
                  category_id,
                  brand_id,
                ],
                (err, resPivot) => {
                  if (shouldAbort(err)) return;
                  client.query("COMMIT", (err) => {
                    if (err) {
                      console.error("Error committing transaction", err.stack);
                      resolve(systemError());
                    }
                    const data = {
                      id: productID,
                      name_store: user.emailOrusername,
                      name_product: name,
                      price: price,
                      description: desc,
                      category: category_id,
                      brand: brand_id,
                      stock: stock,
                      size: size_id,
                      color: color_id,
                      image: file,
                    };
                    resolve(created(data));
                    done();
                  });
                }
              );
            });
          }
        );
      });
    });
  });
};

const getProducts = (queryParams, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = `${hostApi}/api/v1/product?`;
    let query = `select p.id, ui."name" as seller_name, ui.user_id as seller_id  ,p."name" ,p.price, p.description, s."name" as size, c.color, (select i.image from image i where product_id = p.id limit 1) as image, s2.stock, c2."name" as category, b."name" as brand, COALESCE(COUNT(tp.product_id),0) as sold from product_size_color_image psci left join product p on psci.product_id = p.id join size s on psci.size_id = s.id join color c on psci.color_id = c.id join image i on psci.image_id = i.product_id join stock s2 on psci.stock_id = s2.product_id join category c2 on psci.category_id = c2.id join brand b on psci.brand_id = b.id join userinfo ui on p.users_id = ui.user_id full outer join transaction_product tp on p.id = tp.product_id`;
    if (
      queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%')`;
      link += `search=${queryParams.search}&`;
    }
    if (
      queryParams.search &&
      queryParams.category &&
      queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%') and lower(b."name") like lower('%${queryParams.brand}%') and lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}&brand=${queryParams.brand}&color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      queryParams.search &&
      queryParams.category &&
      queryParams.brand &&
      queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%') and lower(b."name") like lower('%${queryParams.brand}%') and lower(c.color) like lower('%${queryParams.color}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}&brand=${queryParams.brand}&color=${queryParams.color}&`;
    }

    if (
      queryParams.search &&
      queryParams.category &&
      queryParams.brand &&
      !queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%') and lower(b."name") like lower('%${queryParams.brand}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}&brand=${queryParams.brand}&size=${queryParams.size}&`;
    }
    if (
      queryParams.search &&
      queryParams.category &&
      queryParams.brand &&
      !queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%') and lower(b."name") like lower('%${queryParams.brand}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}&brand=${queryParams.brand}&`;
    }
    if (
      queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%') and lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}&color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(c2."name") like lower('%${queryParams.category}%')`;
      link += `category=${queryParams.category}`;
    }
    if (
      queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}&size=${queryParams.size}&`;
    }
    if (
      queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%') and lower(c.color) like lower('%${queryParams.color}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}&color=${queryParams.color}&`;
    }
    if (
      queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('%${queryParams.category}%')`;
      link += `search=${queryParams.search}&category=${queryParams.category}`;
    }
    if (
      queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(b."name") like lower('%${queryParams.brand}%') and lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&brand=${queryParams.brand}&color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      !queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(b."name") like lower('%${queryParams.brand}%')`;
      link += `search=${queryParams.search}&brand=${queryParams.brand}&`;
    }
    if (
      queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(b."name") like lower('%${queryParams.brand}%') and lower(c.color) like lower('%${queryParams.color}%')`;
      link += `search=${queryParams.search}&brand=${queryParams.brand}&color=${queryParams.color}&`;
    }
    if (
      queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      !queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(b."name") like lower('%${queryParams.brand}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&brand=${queryParams.brand}&size=${queryParams.size}&`;
    }
    if (
      queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c.color) like lower('%${queryParams.color}%')`;
      link += `search=${queryParams.search}&color=${queryParams.color}&`;
    }
    if (
      queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `search=${queryParams.search}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      queryParams.category &&
      queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(c2."name") like lower('%${queryParams.category}%') and lower(b."name") like lower('%${queryParams.brand}%') and lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `category=${queryParams.category}&brand=${queryParams.brand}&color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(c2."name") like lower('%${queryParams.category}%') and lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `category=${queryParams.category}&color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(c2."name") like lower('%${queryParams.category}%') and lower(c.color) like lower('%${queryParams.color}%')`;
      link += `category=${queryParams.category}&color=${queryParams.color}&`;
    }
    if (
      !queryParams.search &&
      queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(c2."name") like lower('%${queryParams.category}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `category=${queryParams.category}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(b."name") like lower('%${queryParams.brand}%') and lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `brand=${queryParams.brand}&color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(b."name") like lower('%${queryParams.brand}%') and lower(c.color) like lower('%${queryParams.color}%')`;
      link += `brand=${queryParams.brand}&color=${queryParams.color}&`;
    }
    if (
      !queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      !queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(b."name") like lower('%${queryParams.brand}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `brand=${queryParams.brand}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      !queryParams.category &&
      queryParams.brand &&
      !queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(b."name") like lower('%${queryParams.brand}%')`;
      link += `brand=${queryParams.brand}&`;
    }
    if (
      !queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(c.color) like lower('%${queryParams.color}%') and lower(s."name") like lower('%${queryParams.size}%')`;
      link += `color=${queryParams.color}&size=${queryParams.size}&`;
    }
    if (
      !queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      queryParams.color &&
      !queryParams.size
    ) {
      query += ` where lower(c.color) like lower('%${queryParams.color}%')`;
      link += `color=${queryParams.color}&`;
    }
    if (
      !queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      queryParams.size
    ) {
      query += ` where lower(s."name") like lower('%${queryParams.size}%')`;
      link += `size=${queryParams.size}&`;
    }
    if (
      queryParams.startPrice &&
      queryParams.toPrice &&
      !queryParams.search &&
      !queryParams.category &&
      !queryParams.brand &&
      !queryParams.color &&
      !queryParams.size
    ) {
      query += ` where p.price between ${queryParams.startPrice} and ${queryParams.toPrice}`;
      link += `startPrice=${queryParams.startPrice}&toPrice=${queryParams.toPrice}&`;
    }
    if (queryParams.startPrice && queryParams.search) {
      if (
        queryParams.category ||
        queryParams.brand ||
        queryParams.color ||
        queryParams.size
      ) {
        query += ` and p.price between ${queryParams.startPrice} and ${queryParams.toPrice}`;
        link += `startPrice=${queryParams.startPrice}&toPrice=${queryParams.toPrice}&`;
      }
    }
    query += ` group by p.id, ui."name", ui.user_id,p."name" ,p.price, p.description, s."name", c.color, s2.stock, c2."name", b."name"`;
    if (queryParams.price == "expensive") {
      query += ` order by p.price desc`;
      link += `price=${queryParams.price}&`;
    }
    if (queryParams.price == "cheap") {
      query += ` order by p.price asc`;
      link += `price=${queryParams.price}&`;
    }
    if (queryParams.sortby == "latest" && !queryParams.price) {
      query += ` order by p.created_at asc`;
      link += `sortby=${queryParams.sortby}&`;
    }
    if (queryParams.sortby == "latest" && queryParams.price) {
      query += ` , p.created_at asc`;
      link += `sortby=${queryParams.sortby}&`;
    }
    let values = [];
    if (queryParams.page && queryParams.limit) {
      let page = parseInt(queryParams.page);
      let limit = parseInt(queryParams.limit);
      let offset = (page - 1) * limit;
      query += ` limit $1 offset $2`;
      values.push(limit, offset);
    }
    db.query(
      `select p.id, p."name" ,p.price, p.description, s."name" as size, c.color, i.image, s2.stock, c2."name" as category, b."name" as brand from product_size_color_image psci left join product p on psci.product_id = p.id join size s on psci.size_id = s.id join color c on psci.color_id = c.id join image i on psci.image_id = i.product_id join stock s2 on psci.stock_id = s2.product_id join category c2 on psci.category_id = c2.id join brand b on psci.brand_id = b.id`,
      (err, getData) => {
        db.query(query, values, (err, res) => {
          if (err) {
            console.log(err.message);
            resolve(systemError());
          }
          if (res.rows.length === 0) return resolve(notFound());
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
              data: res.rows,
            };
            return resolve(success(sendResponse));
          }
          let sendResponse = {
            dataCount: getData.rows.length,
            next: resNext,
            prev: resPrev,
            totalPage: null,
            data: res.rows,
          };
          resolve(success(sendResponse));
        });
      }
    );
  });
};
const getProductsId = (params) => {
  return new Promise((resolve, reject) => {
    let query = `select p.id, ui."name" as seller_name, ui.user_id as seller_id ,p."name" ,p.price, p.description, s."name" as size, c.color, s2.stock, c2."name" as category, b."name" as brand, COALESCE(COUNT(tp.product_id),0) as sold from product_size_color_image psci left join product p on psci.product_id = p.id join size s on psci.size_id = s.id join color c on psci.color_id = c.id join image i on psci.image_id = i.product_id join stock s2 on psci.stock_id = s2.product_id join category c2 on psci.category_id = c2.id join brand b on psci.brand_id = b.id join userinfo ui on p.users_id = ui.user_id full outer join transaction_product tp on p.id = tp.product_id where p.id = $1 group by p.id, ui."name", ui.user_id,p."name" ,p.price, p.description, s."name", c.color, s2.stock, c2."name", b."name"`;
    let queryImage = `select i.image from image i left join product p on i.product_id = p.id where p.id = $1`;
    let queryRelated = `select p.id, ui."name" as seller_name, ui.user_id as seller_id  ,p."name" ,p.price, p.description, s."name" as size, c.color, (select i.image from image i where product_id = p.id limit 1) as image, s2.stock, c2."name" as category, b."name" as brand, COALESCE(COUNT(tp.product_id),0) as sold from product_size_color_image psci left join product p on psci.product_id = p.id join size s on psci.size_id = s.id join color c on psci.color_id = c.id join image i on psci.image_id = i.product_id join stock s2 on psci.stock_id = s2.product_id join category c2 on psci.category_id = c2.id join brand b on psci.brand_id = b.id join userinfo ui on p.users_id = ui.user_id full outer join transaction_product tp on p.id = tp.product_id  where lower(b."name") like lower($1) and lower(c2."name") like lower($2) group by p.id, ui."name", ui.user_id,p."name" ,p.price, p.description, s."name", c.color, s2.stock, c2."name", b."name"`;
    db.query(query, [params.id], (err, res) => {
      if (err) {
        console.log(err.message);
        resolve(systemError());
      }
      const productDetail = res.rows;
      if (productDetail.length === 0) return resolve(notFound());
      db.query(queryImage, [params.id], (err, results) => {
        if (err) {
          console.log(err.message);
          resolve(systemError());
        }
        const productImage = results.rows;
        db.query(
          queryRelated,
          [productDetail[0].brand, productDetail[0].category],
          (errs, Result) => {
            if (err) {
              console.log(err.message);
              resolve(systemError());
            }
            const productRelaited = Result.rows;
            if (productRelaited.length === 0) return resolve(notFound());
            const data = {
              product: productDetail,
              image: productImage,
              relaited: productRelaited,
            };
            resolve(success(data));
          }
        );
      });
    });
  });
};

// const editProducts = (body, params, file) => {
//   return new Promise((resolve, reject) => {
//     const {
//       name,
//       price,
//       stock,
//       category_id,
//       brand_id,
//       size_id,
//       color_id,
//       description,
//     } = body;
//     let data = {
//       id: params.id,
//     };
//     let statusImage = false;
//     let statusProduct = false;
//     let statusPivot = false;
//     let statusStock = false;
//     if (file) {
//       db.query(
//         `update image set image = ${file} where product_id = $1`,
//         [params.id],
//         (err, resultImage) => {
//           if (err) {
//             console.log(err.message);
//             resolve(systemError());
//           }
//           db.query(`update product set updated_at = now() where id = $1`, [
//             params.id,
//           ])
//             .then((result) => {
//               data["image"] = file;
//               statusImage = true;
//             })
//             .catch((err) => {
//               console.log(err.message);
//               resolve(systemError());
//             });
//         }
//       );
//     }
//     if (body) {
//       let queryProduct = `update product set `;
//       let queryPivot = `update product_size_color_image set `;
//       let queryStock = `update stock set `;
//       let valuesProduct = [];
//       let valuesPivot = [];
//       let valuesStock = [];
//       let countPivot = 0;
//       Object.keys(body).forEach((key, idx, array) => {
//         if (key === "name" || key === "price" || key === "description") {
//           if (name && price && description) countProduct = 3;
//           if (
//             (name && price) ||
//             (price && description) ||
//             (name && description)
//           )
//             countProduct = 2;
//           // if (name || price || description) countProduct = 1;
//           console.log(`CountProduct : ${countProduct}, idx : ${idx + 1}`);
//           if (idx + 1 !== countProduct) {
//             queryProduct += `${key} = $${idx + 1},`;
//             data[key] = body[key];
//             valuesProduct.push(body[key]);
//           }
//           if (idx + 1 === countProduct) {
//             queryProduct += `${key} = $${idx}, updated_at = now() where id = $${
//               idx + 1
//             }`;
//             valuesProduct.push(body[key], params.id);
//             data[key] = body[key];
//           }
//         }
//         if (
//           key === "category_id" ||
//           key === "brand_id" ||
//           key === "size_id" ||
//           key === "color_id"
//         ) {
//           if (key === "category_id") countPivot += 1;
//           if (key === "brand_id") countPivot += 1;
//           if (key === "size_id") countPivot += 1;
//           if (key === "color_id") countPivot += 1;
//           if (idx !== countProduct) {
//             queryPivot += `${key} = $${idx + 1},`;
//             data[key] = body[key];
//             valuesPivot.push(body[key]);
//           }
//           if (idx === countProduct) {
//             queryPivot += `${key} = $${idx} where product_id = $${idx + 1}`;
//             valuesPivot.push(body[key], params.id);
//             data[key] = body[key];
//           }
//         }
//         if (key === "stock") {
//           queryStock += `${key} = $1 where product_id = $2`;
//           valuesStock.push(body[key], params.id);
//           data[key] = body[key];
//         }
//       });
//       if (name || price || description) {
//         db.query(queryProduct, valuesProduct)
//           .then((result) => {
//             statusProduct = true;
//           })
//           .catch((err) => {
//             console.log(err);
//             console.log(queryProduct);
//             console.log(valuesProduct);
//             resolve(systemError());
//           });
//       }
//       if (category_id || brand_id || size_id || color_id) {
//         db.query(queryPivot, valuesPivot)
//           .then((result) => {
//             statusPivot = true;
//           })
//           .catch((err) => {
//             console.log(err);
//             resolve(systemError());
//           });
//       }
//       if (stock) {
//         db.query(queryStock, valuesStock)
//           .then((result) => {
//             statusStock = true;
//           })
//           .catch((err) => {
//             console.log(err);
//             resolve(systemError());
//           });
//       }
//     }
//     if (
//       name &&
//       price &&
//       stock &&
//       category_id &&
//       brand_id &&
//       size_id &&
//       color_id &&
//       description
//     ) {
//       if (statusImage && statusPivot && statusProduct && statusStock)
//         return resolve(success(data));
//     }
//     if (
//       name ||
//       price ||
//       (description &&
//         !stock &&
//         !category_id &&
//         !brand_id &&
//         !size_id &&
//         !color_id)
//     ) {
//       if (statusProduct) return resolve(success(data));
//     }
//   });
// };

const deleteProducts = (params, payload) => {
  return new Promise((resolve, reject) => {
    const query = "delete from product_size_color_image where product_id = $1";
    db.query(
      `select * from product where id = ${params.id}`,
      (err, resultGet) => {
        if (err) {
          console.log(err.message);
          resolve(systemError);
        }
        if (resultGet.rows[0].users_id !== payload.user_id)
          return resolve(custMsg("Only Owner This Product Can Delete"));
        db.query(query, [params.id], (err, resultPivot) => {
          if (err) {
            console.log(err);
            return resolve(systemError());
          }
          db.query(
            "delete from image where product_id = $1",
            [params.id],
            (err, resultStock) => {
              if (err) {
                console.log(err);
                return resolve(systemError());
              }
              db.query(
                "delete from stock where product_id = $1",
                [params.id],
                (err, resultStock) => {
                  if (err) {
                    console.log(err);
                    return resolve(systemError());
                  }
                  resolve(success(`Product ID.${params.id} success deleted.`));
                }
              );
            }
          );
        });
      }
    );
  });
};

const getProductBySeller = (params, payload) => {
  return new Promise((resolve, reject) => {
    let queryGet = `select p.*, (select i.image from image i where product_id = p.id limit 1) as image, s2.stock from product p left join userinfo u on p.users_id = u.user_id join stock s on p.id = s.product_id join product_size_color_image psci on p.id = psci.product_id join stock s2 on psci.stock_id = s2.product_id where u.user_id = ${payload.user_id} group by p.id, s2.stock`;
    if (params) {
      if (params.filter === "soldout") queryGet += ` and s.stock = '0'`;
    }
    db.query(queryGet, (err, resultGet) => {
      if (err) {
        console.log(err.message);
        resolve(systemError);
      }
      resolve(success(resultGet.rows));
    });
  });
};

const productsRepo = {
  createProducts,
  getProducts,
  deleteProducts,
  getProductsId,
  getProductBySeller,
};

module.exports = productsRepo;
