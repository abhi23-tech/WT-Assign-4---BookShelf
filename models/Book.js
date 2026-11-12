const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    author: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide a category/genre'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price must be a positive number']
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide the quantity in stock'],
      min: [0, 'Quantity cannot be negative'],
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Book', bookSchema);

