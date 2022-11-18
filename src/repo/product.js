const response = require("../helpers/response");
const {
  success,
  notFound,
  systemError,
  created,
  invalidParameter,
} = require("../helpers/templateResponse");
const db = require("../config/database");

const createProducts = (body, file) => {
  return new Promise((resolve, reject) => {
    // console.log(file);
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
        console.log(desc);
        const queryText =
          "insert into product (name, price, description) values ($1,$2,$3) RETURNING id";
        console.log(queryText);
        client.query(queryText, [name, price, desc], (err, res) => {
          if (shouldAbort(err)) return;
          const productID = res.rows[0].id;
          console.log({ file });
          let inputImage =
            "insert into image (product_id, image) values ($1,$2)";
          client.query(inputImage, [productID, file], (err, resImage) => {
            if (shouldAbort(err)) return;
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
                      name: name,
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
          });
        });
      });
    });
  });
};

const getProducts = (queryParams, hostApi) => {
  return new Promise((resolve, reject) => {
    let link = `${hostApi}/api/v1/products?`;
    console.log(queryParams);
    let query = `select p.id, p."name" ,p.price, s."name" as size, c.color, i.image, s2.stock, c2."name" as category, b."name" as brand from product_size_color_image psci left join product p on psci.product_id = p.id join size s on psci.size_id = s.id join color c on psci.color_id = c.id join image i on psci.image_id = i.product_id join stock s2 on psci.stock_id = s2.product_id join category c2 on psci.category_id = c2.id join brand b on psci.brand_id = b.id`;
    if (queryParams.search && !queryParams.category && !queryParams.brand) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%')`;
      link += `search=${queryParams.search}&`;
    }
    if (queryParams.category && queryParams.search) {
      query += ` where lower(p."name") like lower('%${queryParams.search}%') and lower(c2."name") like lower('${queryParams.category}')`;
      link += `category=${queryParams.category}&`;
    }
    if (queryParams.category && !queryParams.search) {
      query += ` where lower(c2."name") like lower ('${queryParams.category}')`;
      link += `category=${queryParams.category}&`;
    }
    if (queryParams.sortby == "latest") {
      query += ` order by p.created_at asc`;
      link += `sortby=${queryParams.sortby}&`;
    }
    if (queryParams.price == "expensive") {
      query += ` order by p.price desc`;
      link += `price=${queryParams.price}&`;
    }
    if (queryParams.price == "cheap") {
      query += ` order by p.price asc`;
      link += `price=${queryParams.price}&`;
    }
    console.log(query);
    db.query(query, (err, res) => {
      if (err) {
        console.log(err);
        resolve(systemError());
      }
      resolve(success(res.rows));
    });
  });
};

const productsRepo = {
  createProducts,
  getProducts,
};

module.exports = productsRepo;
