const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const username_exists = users.filter((user) => {
      return user.username === username;
    });

    if (isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function(req, res) {
  let promise = new Promise((resolve, reject) => {
    const books_list = JSON.stringify(books, null, 4);
    resolve(books_list);
  });
  
  promise.then((books_list) => {
    res.send(books_list);
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  let promise = new Promise((resolve, reject) => {
    const book = books[isbn];
    resolve(book);
  });

  promise.then((book) => {
    if (book) {
      res.send(books[isbn]);
    } else {
      res.status(404).json({message: `No book found with ISBN (${isbn})`});
    }
  })
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  let promise = new Promise((resolve, reject) => {
    let filtered_books = {}

    for (const book_key in books) {
      const book = books[book_key];
      if (book.author === author) {
        filtered_books[book_key] = book;
      }
    }

    resolve(filtered_books);
  });

  promise.then((filtered_books) => {
    if (Object.keys(filtered_books).length === 0) {
      res.status(404).json({message: `No book found with author (${author})`});
    } else {
      res.send(filtered_books);
    }
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  let promise = new Promise((resolve, reject) => {
    let filtered_books = {}

    for (const book_key in books) {
      const book = books[book_key];
      if (book.title === title) {
        filtered_books[book_key] = book;
      }
    }

    resolve(filtered_books);
  });

  promise.then((filtered_books) => {
    if (Object.keys(filtered_books).length === 0) {
      res.status(404).json({message: `No book found with title (${title})`});
    } else {
      res.send(filtered_books);
    }
  });
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({message: `No book found with ISBN (${isbn})`});
  }
});

module.exports.general = public_users;
