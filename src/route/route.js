const express = require('express');
const router = express.Router();
const BookController= require("../Controller/bookController")
const UserController= require("../Controller/userController")
const {authentication} = require("../Middleware/auth")

//First API -: To register a user by POST method
router.post("/register", UserController.createUser)

//Second API -: To login a user by POST method
router.post("/login" , UserController.loginUser)

//Third API-: To create a book for a user(only by admin) by POST method
router.post("/books" ,authentication, BookController.createBook)

//Fourth API -: get a particular book(only by admin and mideator) by get method
router.get("/books/:bookId" , authentication , BookController.viewParticulerBooks)

//Fifth API -: get all the available book (by admin,mediator and customer)
router.get("/book" , authentication , BookController.viewAllBooks)

module.exports = router;