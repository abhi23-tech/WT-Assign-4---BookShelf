# 📚 Book Management REST API

A clean, production-ready Book Management REST API built with **Node.js**, **Express.js**, and **MongoDB Atlas** using **Mongoose**. Implements full CRUD operations, robust error handling, input validation, and is configured for deployment on **Render** via **GitHub**.

---

## 🚀 Features

- **Complete CRUD Operations**:
  - `POST /api/books` - Add a new book (`title`, `author`, `category`, `price`, `quantity`).
  - `GET /api/books` - Retrieve all books (with optional category/author filter and search).
  - `GET /api/books/:id` - Retrieve a specific book by ID.
  - `PUT /api/books/:id` - Update book details.
  - `DELETE /api/books/:id` - Delete a book by ID.
- **Data Validation & Sanitization**: Enforced via Mongoose Schema.
- **Comprehensive Error Handling**: Centralized error middleware handling invalid ObjectIds (`CastError`), validation failures (`ValidationError`), and 404s.
- **Clean Architecture**: Organized separation of concerns (`config`, `controllers`, `models`, `routes`, `middleware`).
- **Postman Ready**: Pre-configured Postman Collection file (`postman_collection.json`) included with automated variable passing.
- **Render Ready**: Configured dynamic PORT, `start` script, and `.env.example` for deployment.

---

## 📁 Project Structure

```text
├── config/
│   └── db.js                 # MongoDB Atlas connection via Mongoose
├── controllers/
│   └── bookController.js     # Business logic & CRUD controller handlers
├── middleware/
│   └── errorHandler.js       # 404 and centralized error handler
├── models/
│   └── Book.js               # Mongoose schema for Book entity
├── public/
│   ├── css/style.css         # Modern styling & animations
│   ├── js/app.js             # Client SPA logic for CRUD & UI reactivity
│   └── index.html            # Web dashboard UI
├── routes/
│   └── bookRoutes.js         # REST route definitions
├── .env                      # Local environment variables (Ignored in Git)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules (node_modules, .env, etc.)
├── package.json              # Project dependencies & npm scripts
├── postman_collection.json   # 1-click Postman collection import
├── README.md                 # Project documentation
└── server.js                 # Express application entrypoint
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Configuration**: dotenv
- **Cross-Origin**: cors

---

## 📦 Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB Atlas** account (Free tier)
- **Postman** (Desktop application or web agent)
- **Git** and a **GitHub** account

---

## ⚙️ Local Setup Instructions

### 1. Clone or Open the Repository
```bash
cd "Assignment 6"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in.
2. Create a free **M0 cluster** if you don't have one.
3. Under **Security > Database Access**, create a database user (e.g., `book_admin`) with a secure password and `Read and write to any database` privilege.
4. Under **Security > Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) so both local testing and Render can connect.
5. In **Database > Clusters**, click **Connect** > **Drivers** (Node.js). Copy the connection string. It looks like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookstore?retryWrites=true&w=majority
   ```

### 4. Configure Environment Variables
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your connection string and port:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookstore?retryWrites=true&w=majority
```
*(Replace `<username>` and `<password>` with your actual MongoDB Atlas credentials).*

### 5. Start the Server
- For production/normal mode:
  ```bash
  npm start
  ```
- For development mode (with auto-reload):
  ```bash
  npm run dev
  ```

Output:
```text
Server running in development mode on port 5000
MongoDB Connected: cluster0-shard-00-00.mongodb.net
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Request Body | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | Root / Health check & route summary | None | `200 OK` |
| **POST** | `/api/books` | Add a new book | JSON (title, author, category, price, quantity) | `201 Created` |
| **GET** | `/api/books` | Retrieve all books (or search/filter) | None (optional query params: `?category=...&search=...`) | `200 OK` |
| **GET** | `/api/books/:id` | Retrieve single book by ID | None | `200 OK` |
| **PUT** | `/api/books/:id` | Update book details | JSON (any fields to update) | `200 OK` |
| **DELETE**| `/api/books/:id` | Remove a book by ID | None | `200 OK` |

---

## 🧪 Testing Every Endpoint with Postman

### Method 1: Import the Included Collection (Recommended)
1. Open Postman.
2. Click **Import** (top left).
3. Drag & drop or select the file **`postman_collection.json`** located in the project root.
4. The collection is already pre-configured with:
   - `{{base_url}}` set to `http://localhost:5000`.
   - Automatic script on Request 1 (`POST`) that captures the newly created `_id` into `{{book_id}}` so you can immediately run `GET by ID`, `PUT`, and `DELETE` without copying IDs manually!

---

### Method 2: Manual Endpoint Testing

#### 1. POST - Add a New Book
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/books`
- **Headers**: `Content-Type: application/json`
- **Body** (`raw` JSON):
  ```json
  {
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "author": "Robert C. Martin",
    "category": "Software Engineering",
    "price": 34.99,
    "quantity": 15
  }
  ```
- **Expected Status**: `201 Created`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Book created successfully",
    "data": {
      "_id": "6733a1e2f3d9b4001c23a4b5",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "author": "Robert C. Martin",
      "category": "Software Engineering",
      "price": 34.99,
      "quantity": 15,
      "createdAt": "2026-11-12T15:00:00.000Z",
      "updatedAt": "2026-11-12T15:00:00.000Z",
      "__v": 0
    }
  }
  ```

---

#### 2. GET - Retrieve All Books
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/books`
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "6733a1e2f3d9b4001c23a4b5",
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "author": "Robert C. Martin",
        "category": "Software Engineering",
        "price": 34.99,
        "quantity": 15,
        "createdAt": "2026-11-12T15:00:00.000Z",
        "updatedAt": "2026-11-12T15:00:00.000Z"
      }
    ]
  }
  ```
- *(Optional filter test)*: `http://localhost:5000/api/books?category=Software` or `http://localhost:5000/api/books?search=Martin`

---

#### 3. GET - Retrieve a Book by ID
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/books/<PASTE_BOOK_ID_HERE>`
  *(Example: `http://localhost:5000/api/books/6733a1e2f3d9b4001c23a4b5`)*
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6733a1e2f3d9b4001c23a4b5",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "author": "Robert C. Martin",
      "category": "Software Engineering",
      "price": 34.99,
      "quantity": 15
    }
  }
  ```

---

#### 4. PUT - Update Book Details
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/books/<PASTE_BOOK_ID_HERE>`
- **Headers**: `Content-Type: application/json`
- **Body** (`raw` JSON):
  ```json
  {
    "price": 29.99,
    "quantity": 25
  }
  ```
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Book updated successfully",
    "data": {
      "_id": "6733a1e2f3d9b4001c23a4b5",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "author": "Robert C. Martin",
      "category": "Software Engineering",
      "price": 29.99,
      "quantity": 25,
      "updatedAt": "2026-11-12T15:05:00.000Z"
    }
  }
  ```

---

#### 5. DELETE - Remove a Book
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/books/<PASTE_BOOK_ID_HERE>`
- **Expected Status**: `200 OK`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Book deleted successfully",
    "data": {
      "id": "6733a1e2f3d9b4001c23a4b5",
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship"
    }
  }
  ```

---

#### 6. Error Handling Tests

| Scenario | Request | Expected Status | Expected Response |
| :--- | :--- | :--- | :--- |
| **Missing Fields** | `POST /api/books` with body `{ "title": "Missing author" }` | `400 Bad Request` | `{"success": false, "message": "Please provide all required fields..."}` |
| **Invalid Price** | `POST /api/books` with body `{"price": -10}` | `400 Bad Request` | `{"success": false, "message": "Price must be a positive number"}` |
| **Invalid ID Format** | `GET /api/books/123-abc` | `400 Bad Request` | `{"success": false, "message": "Invalid Book ID format: 123-abc"}` |
| **Non-existent ID** | `GET /api/books/64b5f8384234567890123456` | `404 Not Found` | `{"success": false, "message": "Book not found with id: 64b5f8384234567890123456"}` |
| **Route Not Found** | `GET /api/unknown-route` | `404 Not Found` | `{"success": false, "message": "Resource not found - /api/unknown-route"}` |

---

## 🚀 Deployment Guide: GitHub + Render

### Step 1: Push Code to GitHub

1. Stage all project files (verify `.env` is ignored):
   ```bash
   git add .
   git commit -m "Initial commit: Book Management REST API"
   ```
2. Create a new repository on [GitHub](https://github.com/new) (e.g., `book-management-api`). Leave it public or private, do not initialize with README.
3. Link your local repo and push to GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/book-management-api.git
   git push -u origin main
   ```

### Step 2: Deploy to Render

1. Go to [Render](https://render.com) and sign in.
2. Click **New +** > **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub account.
4. Select your `book-management-api` repository.
5. Configure the deployment settings:
   - **Name**: `book-management-api` (or your choice)
   - **Region**: Choose the region closest to you or your MongoDB cluster (e.g., Oregon, Singapore, Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Scroll down to **Environment Variables** and click **Add Environment Variable**:
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/bookstore?retryWrites=true&w=majority`
   - `NODE_ENV`: `production`
7. Click **Deploy Web Service**.
8. Render will pull your repo, run `npm install`, and start `node server.js`. Once the logs show:
   ```text
   ==> Your service is live 🎉 at https://book-management-api.onrender.com
   Server running in production mode on port 10000
   MongoDB Connected: cluster0-shard-00-00.mongodb.net
   ```

### Step 3: Test the Live Render API with Postman
1. In Postman, open the **Book Management API** collection.
2. Edit the collection variable `base_url`:
   - Change `http://localhost:5000` to `https://<your-service-name>.onrender.com`.
3. Run the requests! All CRUD operations will now execute against your live hosted REST API on Render connected to MongoDB Atlas.

---

## 📜 License
ISC License. Feel free to use and adapt this project for educational and assignment purposes.

