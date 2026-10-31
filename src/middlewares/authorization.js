const DBHelper = require("../utils/db-helper");
const logger = require("../utils/logger");

function getCurrentUser(req, res, callback) {
  const email = req.auth && req.auth.name;
  if (!email) {
    res.status(401).send({ error_message: "Authentication required" });
    return;
  }

  DBHelper(
    "SELECT id, email, role FROM user WHERE email = ?",
    (err, results) => {
      if (err) {
        logger.error(err);
        res.status(500).send({ error_message: "Internal server error" });
        return;
      }
      if (!results.length) {
        res.status(401).send({ error_message: "Authentication required" });
        return;
      }
      req.currentUser = results[0];
      callback(results[0]);
    },
    [email]
  );
}

function isAdmin(user) {
  return String(user.role || "").toLowerCase() === "admin";
}

function requireAdmin(req, res, next) {
  getCurrentUser(req, res, (user) => {
    if (!isAdmin(user)) {
      res.status(403).send({ error_message: "Administrator access required" });
      return;
    }
    next();
  });
}

function loadCurrentUser(req, res, next) {
  getCurrentUser(req, res, () => next());
}

function requireOwnUserOrAdmin(req, res, next) {
  const targetEmail = (req.body && req.body.email) || (req.query && req.query.email);
  if (typeof targetEmail !== "string" || !targetEmail.trim()) {
    res.status(400).send({ error_message: "A valid email is required" });
    return;
  }

  getCurrentUser(req, res, (user) => {
    if (isAdmin(user) || user.email.toLowerCase() === targetEmail.trim().toLowerCase()) {
      next();
      return;
    }
    res.status(403).send({ error_message: "You cannot access this user" });
  });
}

function requireOwnUserIdOrAdmin(req, res, next) {
  const userId = (req.body && req.body.user_id) || (req.query && req.query.user_id);
  if (!/^\d+$/.test(String(userId || "")) || Number(userId) < 1) {
    res.status(400).send({ error_message: "A valid user_id is required" });
    return;
  }

  getCurrentUser(req, res, (user) => {
    if (isAdmin(user) || Number(user.id) === Number(userId)) {
      next();
      return;
    }
    res.status(403).send({ error_message: "You cannot access this user" });
  });
}

function requireCommentOwnerOrAdmin(req, res, next) {
  const commentId = (req.body && req.body.comment_id) || (req.query && req.query.id);
  if (!/^\d+$/.test(String(commentId || "")) || Number(commentId) < 1) {
    res.status(400).send({ error_message: "A valid comment id is required" });
    return;
  }

  getCurrentUser(req, res, (user) => {
    DBHelper(
      "SELECT author FROM comment WHERE id = ?",
      (err, results) => {
        if (err) {
          logger.error(err);
          res.status(500).send({ error_message: "Unable to verify comment ownership" });
          return;
        }
        if (!results.length) {
          res.status(404).send({ error_message: "Comment not found" });
          return;
        }
        if (isAdmin(user) || results[0].author === user.email) {
          next();
          return;
        }
        res.status(403).send({ error_message: "You cannot access this comment" });
      },
      [commentId]
    );
  });
}

module.exports = {
  requireAdmin,
  loadCurrentUser,
  requireOwnUserOrAdmin,
  requireOwnUserIdOrAdmin,
  requireCommentOwnerOrAdmin,
};
