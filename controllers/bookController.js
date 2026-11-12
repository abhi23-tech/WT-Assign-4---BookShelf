const mongoose = require('mongoose');
const Book = require('../models/Book');

/**
 * @desc    Create a new book
 * @route   POST /api/books
 * @access  Public
 */
const createBook = async (req, res, next) => {
  try {
    const { title, author, category, price, quantity } = req.body;

    // Validate required fields
    if (!title || !author || !category || price === undefined || quantity === undefined) {
      res.status(400);
      throw new Error('Please provide all required fields: title, author, category, price, quantity');
    }

    const newBook = await Book.create({
      title,
      author,
      category,
      price,
      quantity
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: newBook
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all books (with optional filtering by category or author, and search by title)
 * @route   GET /api/books
 * @access  Public
 */
const getAllBooks = async (req, res, next) => {
  try {
    const { category, author, search } = req.query;
    const query = {};

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const books = await Book.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid Book ID format: ${id}`);
    }

    const book = await Book.findById(id);

    if (!book) {
      res.status(404);
      throw new Error(`Book not found with id: ${id}`);
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update book details by ID
 * @route   PUT /api/books/:id
 * @access  Public
 */
const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid Book ID format: ${id}`);
    }

    // Check if body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400);
      throw new Error('Please provide at least one field to update');
    }

    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true, // returns the updated document
      runValidators: true // ensures schema validation rules run on update
    });

    if (!updatedBook) {
      res.status(404);
      throw new Error(`Book not found with id: ${id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a book by ID
 * @route   DELETE /api/books/:id
 * @access  Public
 */
const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid Book ID format: ${id}`);
    }

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      res.status(404);
      throw new Error(`Book not found with id: ${id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: {
        id: deletedBook._id,
        title: deletedBook.title
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
};
