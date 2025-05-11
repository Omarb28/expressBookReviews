const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });

  return userswithsamename.length == 0;
}

const authenticatedUser = (username,password) => { //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });

  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 });

      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send({ message: "User successfully logged in"});
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;

  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    res.status(404).json({message: `No book found with ISBN (${isbn})`});
  }
  else {
    const review = req.body.review;
    const review_exists = username in book.reviews;
    book.reviews[username] = review;

    if (!review_exists) {
      res.send({message: `Your review has been added for the book with ISBN (${isbn})`});
    }
    else {
      res.send({message: `Your review has been modified for the book with ISBN (${isbn}})`});
    }
  }
});

// Delete  a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;

  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    res.status(404).json({message: `No book found with ISBN (${isbn})`});
  }
  else {
    const review_exists = username in book.reviews;

    if (review_exists) {
      delete book.reviews[username];
      res.send({message: `Your review has been deleted for the book with ISBN (${isbn})`});
    } else {
      res.send({message: `Your review no longer exists for the book with ISBN (${isbn})`});
    }
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
