const DBHelper = require("../utils/db-helper");
const logger = require("../utils/logger");

function getPagination(req) {
  const requestedPage = Number.parseInt(req.query.page, 10);
  const requestedPageSize = Number.parseInt(req.query.pageSize, 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = Number.isInteger(requestedPageSize) && requestedPageSize > 0
    ? Math.min(requestedPageSize, 100)
    : 20;

  return { page, pageSize, offset: (page - 1) * pageSize };
}

function getPagedList(req, res, dataSql, countSql) {
  const { page, pageSize, offset } = getPagination(req);

  DBHelper(countSql, (countError, countResults) => {
    if (countError) {
      logger.error(countError);
      res.status(500).send({ error_message: "Unable to load records" });
      return;
    }

    const total = Number(countResults[0].total);
    DBHelper(dataSql, (dataError, results) => {
      if (dataError) {
        logger.error(dataError);
        res.status(500).send({ error_message: "Unable to load records" });
        return;
      }

      res.status(200).send({ data: results, total, page, pageSize });
    }, [offset, pageSize]);
  });
}

class ApiAdmin {
  static getUsers(req, res) {
    const dataSql = `SELECT id, name, email, avatar, role FROM user ORDER BY id ASC LIMIT ?, ?`;
    const countSql = `SELECT COUNT(*) AS total FROM user`;
    getPagedList(req, res, dataSql, countSql);
  }

  static getBooks(req, res) {
    const dataSql = `SELECT id, name, author, price, tag, size, created_at FROM book ORDER BY id ASC LIMIT ?, ?`;
    const countSql = `SELECT COUNT(*) AS total FROM book`;
    getPagedList(req, res, dataSql, countSql);
  }

  static getComments(req, res) {
    const dataSql = `SELECT id, book_id, author, detail, created_at FROM comment ORDER BY id ASC LIMIT ?, ?`;
    const countSql = `SELECT COUNT(*) AS total FROM comment`;
    getPagedList(req, res, dataSql, countSql);
  }
}

module.exports = ApiAdmin;
