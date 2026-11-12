require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Connect to Database
connectDB();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Book Management REST API is running!',
    endpoints: {
      getAllBooks: 'GET /api/books',
      getBookById: 'GET /api/books/:id',
      createBook: 'POST /api/books',
      updateBook: 'PUT /api/books/:id',
      deleteBook: 'DELETE /api/books/:id'
    }
  });
});

// API Routes
app.use('/api/books', bookRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Port Configuration for Local and Render deployment
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

