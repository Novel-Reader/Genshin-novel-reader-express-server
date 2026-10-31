const DBHelper = require("../utils/db-helper");
const logger = require("../utils/logger");
const { isValidBookId } = require("../utils/validation");

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
    const dataSql = `SELECT id, name, author, price, tag, size, created_at, download_count FROM book ORDER BY id ASC LIMIT ?, ?`;
    const countSql = `SELECT COUNT(*) AS total FROM book`;
    getPagedList(req, res, dataSql, countSql);
  }

  static getComments(req, res) {
    const dataSql = `SELECT id, book_id, author, detail, created_at FROM comment ORDER BY id ASC LIMIT ?, ?`;
    const countSql = `SELECT COUNT(*) AS total FROM comment`;
    getPagedList(req, res, dataSql, countSql);
  }

  static getStatistics(req, res) {
    const totalsSql = `SELECT
      (SELECT COUNT(*) FROM user) AS users,
      (SELECT COUNT(*) FROM book) AS books,
      (SELECT COUNT(*) FROM comment) AS comments`;
    DBHelper(totalsSql, (totalsError, totalsResults) => {
      if (totalsError) {
        logger.error(totalsError);
        res.status(500).send({ error_message: "Unable to load statistics" });
        return;
      }

      const authorsSql = `SELECT author, COUNT(*) AS count FROM comment GROUP BY author ORDER BY count DESC LIMIT 12`;
      DBHelper(authorsSql, (authorsError, authorResults) => {
        if (authorsError) {
          logger.error(authorsError);
          res.status(500).send({ error_message: "Unable to load statistics" });
          return;
        }

        const booksSql = `SELECT b.id AS book, b.name, COUNT(c.id) AS count FROM comment c JOIN book b ON c.book_id = b.id GROUP BY b.id, b.name ORDER BY count DESC LIMIT 12`;
        DBHelper(booksSql, (booksError, bookResults) => {
          if (booksError) {
            logger.error(booksError);
            res.status(500).send({ error_message: "Unable to load statistics" });
            return;
          }
          res.status(200).send({
            ...totalsResults[0],
            commentAuthors: authorResults,
            commentBooks: bookResults,
          });
        });
      });
    });
  }

  static getBookStatistics(req, res) {
    const { book_id: bookId } = req.query;
    if (!isValidBookId(bookId)) {
      res.status(400).send({ error_message: "A valid book_id is required" });
      return;
    }
    const numericBookId = Number(bookId);

    const { page, pageSize, offset } = getPagination(req);
    const bookSql = `SELECT id, name, author, price, size, download_count FROM book WHERE id = ?`;
    DBHelper(bookSql, (bookError, books) => {
      if (bookError) {
        logger.error(bookError);
        res.status(500).send({ error_message: "Unable to load book statistics" });
        return;
      }
      if (books.length === 0) {
        res.status(404).send({ error_message: "Book not found" });
        return;
      }

      const authorsSql = `SELECT author, COUNT(*) AS count FROM comment WHERE book_id = ? GROUP BY author ORDER BY count DESC LIMIT 12`;
      DBHelper(authorsSql, (authorsError, authors) => {
        if (authorsError) {
          logger.error(authorsError);
          res.status(500).send({ error_message: "Unable to load book statistics" });
          return;
        }

        const countSql = `SELECT COUNT(*) AS total FROM comment WHERE book_id = ?`;
        DBHelper(countSql, (countError, countResults) => {
          if (countError) {
            logger.error(countError);
            res.status(500).send({ error_message: "Unable to load book statistics" });
            return;
          }

          const commentsSql = `SELECT id, author, detail, created_at FROM comment WHERE book_id = ? ORDER BY id DESC LIMIT ?, ?`;
          DBHelper(commentsSql, (commentsError, comments) => {
            if (commentsError) {
              logger.error(commentsError);
              res.status(500).send({ error_message: "Unable to load book statistics" });
              return;
            }
            res.status(200).send({
              book: books[0],
              commentAuthors: authors,
              comments: {
                data: comments,
                total: Number(countResults[0].total),
                page,
                pageSize,
              },
            });
      }, [numericBookId, offset, pageSize]);
        }, [numericBookId]);
      }, [numericBookId]);
    }, [numericBookId]);
  }
}

module.exports = ApiAdmin;
