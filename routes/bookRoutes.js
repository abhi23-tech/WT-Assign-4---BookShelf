const express = require('express');
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

// Routes for /api/books
router.route('/')
  .post(createBook)
  .get(getAllBooks);

// Routes for /api/books/:id
router.route('/:id')
  .get(getBookById)
  .put(updateBook)
  .delete(deleteBook);

module.exports = router;

