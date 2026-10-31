const express = require("express");
const ApiComment = require('./api-comment');
const ApiAdmin = require('./api-admin');
const ApiNovel = require('./api-novel');
const ApiUser = require('./api-user');
const ApiLogin = require('./api-login');
const ApiUserBook = require('./api-user-book');
const crossOriginMiddleWare = require("../middlewares/cross-origin");
const verifyTokenExpiresMiddleWare = require("../middlewares/verify-token-expires");
const { uploadNovels } = require("../middlewares/upload-novels");
const {
  requireAdmin,
  loadCurrentUser,
  requireOwnUserOrAdmin,
  requireOwnUserIdOrAdmin,
  requireCommentOwnerOrAdmin,
} = require("../middlewares/authorization");

const router = express.Router();

router.use(crossOriginMiddleWare);

// Login and registration are public. All following API routes require a JWT.
router.post("/login", ApiLogin.login);
router.post("/user", ApiUser.addUser);

router.use(verifyTokenExpiresMiddleWare);

router.get("/user", requireOwnUserOrAdmin, ApiUser.getUserInfo);
router.delete("/user", requireAdmin, ApiUser.deleteUser);
router.post("/user-password", requireOwnUserOrAdmin, ApiUser.changeUserPassword);
router.post("/user-avatar", requireOwnUserOrAdmin, ApiUser.changeUserAvatar);

router.post("/novel", requireAdmin, ApiNovel.addNovel);
router.delete("/novel", requireAdmin, ApiNovel.deleteNovel);
router.get("/novel_list", ApiNovel.getNovelList);
router.post("/search-novel", ApiNovel.searchNovel);
router.get("/novel-detail", loadCurrentUser, ApiNovel.getNovelDetail);

router.post("/batch-upload-novel", requireAdmin, uploadNovels, ApiNovel.batchUploadNovel);

router.post("/comment", loadCurrentUser, ApiComment.postComment);
router.get("/comment", ApiComment.getComment);
router.put("/comment", requireCommentOwnerOrAdmin, ApiComment.updateComment);
router.delete("/comment", requireCommentOwnerOrAdmin, ApiComment.deleteComment);

router.get("/admin/users", requireAdmin, ApiAdmin.getUsers);
router.get("/admin/books", requireAdmin, ApiAdmin.getBooks);
router.get("/admin/comments", requireAdmin, ApiAdmin.getComments);
router.get("/admin/statistics", requireAdmin, ApiAdmin.getStatistics);
router.get("/admin/book-statistics", requireAdmin, ApiAdmin.getBookStatistics);

router.get("/user-book", requireOwnUserIdOrAdmin, ApiUserBook.getUserBookList);
router.post("/user-book", requireOwnUserIdOrAdmin, ApiUserBook.updateUserBook);
router.delete("/user-book", requireOwnUserIdOrAdmin, ApiUserBook.deleteUserBook);

module.exports = router;
