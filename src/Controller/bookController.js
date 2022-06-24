const BookModel = require("../model/bookModel")
const UserModel = require("../model/userModel")

//Creating a validation function
const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
}


/* if you are a admin you can ------> create book
                                      view all book
                                      view particuler book

 if you are a customer you can ---------> view all book
 
 if you are a moderator you can -------->view all book
                                         view particuler book

 */
//=============================================================================================================================================//
// only admin create the book
//Third API function(for creating a book document)
const createBook = async (req, res) => {
    try {
        //Checking if no data is present in request body
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "Please provide some data to create a book document" })
        }

        //Checking if user has entered these mandatory fields or not
        const { title, userId, category, releasedAt} = data

        if (!isValid(title)) {
             return res.status(400).send({ status: false, message: "title is required" })
             }

        //Checking if title already exists (i.e. title is not unique)
        let uniqueTitle = await BookModel.findOne({title : data.title})
        if (uniqueTitle) {
          return res.status(400).send({status: false , message: "title already exists"})
             }
          
       //checking if userId is empty string or not
        if (!isValid(userId)) { 
            return res.status(400).send({ status: false, message: "userId is required" })
         }

        //Checking if User Id is a valid type Object Id or not
        let UserId = data.userId
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (!validateUserId(UserId)){
        return res.status(400).send({status: false , message: `${UserId} is not valid type user Id`})
        }

        //Checking if user with this id exists in our collection or not
        let userExist=await UserModel.findOne({_id:UserId}).select({role:1,_id:0})
         if (!userExist) {
            return res.status(400).send({status: false , message: "No such user exists with this id and role"})
        }
        // ckecking if your role if able to to that task or not
        let Role=userExist.role;
        let validRole= function(value){
            for(let i=0;i<value.length;i++){
                if((value[i]=="admin")) return true;
            }
            return false;
        }
        if (!validRole(Role)) {
            return res.status(403).send({status: false , message: "You are not abale to do that"})
        }

       
        // checking if your book category is valid or not
        if (!isValid(category)) { 
            return res.status(400).send({ status: false, message: "category is required" })
         }

         if (!isValid(releasedAt)) { 
            return res.status(400).send({ status: false, message: "releasedAt is required" })
         }
        
        //Checking if that releasedAt is a valid date and in valid format or not
         let ReleasedAt = data.releasedAt
        let validateReleasedAt = function (ReleasedAt) {
            return /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(ReleasedAt)
        }
        if (!validateReleasedAt(ReleasedAt)){
        return res.status(400).send({status: false , message: "Please enter valid date in a valid format i.e. YYYY-MM-DD"})
        }

       //If all the validations passed , send a successfull response
        let bookData = await BookModel.create(data)
        return res.status(201).send({status: true , message: "Your book is successfully created", data: bookData })
    }

    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

//=======================================================================================================================//
// only admin and mediator can view those books
const viewParticulerBooks = async (req , res) => {
    try {
        //taking the book id from path params
        let book_Id = req.params.bookId
        const filterQuery = {isDeleted: false , deletedAt: null}
        //validation check of book id
        let validateUserId = function (BookId) {
            return /^[a-f\d]{24}$/.test(BookId)
        }
        if (isValid(book_Id) && validateUserId(book_Id)) {
            filterQuery['bookId'] = book_Id
            }
        //Validate: The bookId is exist or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) {
        return res.status(404).send({ status: false, message: "Book does not exists" })
       }

       //Validate: If the bookId exists (must have isDeleted false)
       let is_Deleted = Book.isDeleted
       if (is_Deleted == true) {
           return res.status(404).send({ status: false, message: "Book does not exists" })
       }
       // try to get the userid for a particuler book id
        const user_Id=await BookModel.findById(book_Id).select({userId:1, id:0})
        let UserId=user_Id.userId
            //checking the role if suitable for do that work
            let userExist=await UserModel.findOne({_id:UserId}).select({role:1,_id:0})
            if (!userExist) {
               return res.status(400).send({status: false , message: "No such user exists with this id and role"})
           }
           let Role=userExist.role;
           let validRole= function(value){
               for(let i=0;i<value.length;i++){
                   if(((value[i]=="admin")&& (value[i]=="moderator"))||(value[i]=="admin") || (value[i]=="moderator")) return true;
               }
               return false;
           }
           if (!validRole(Role)) {
               return res.status(403).send({status: false , message: "You can not do this task"})
           }

        //Fetching books which have the above filters
        const books = await BookModel.find({$and : [filterQuery]})
        //If no such book found
        if (Array.isArray(books) && books.length == 0) {
            return res.status(404).send({ status: false, msg: "No books found" })
        }
        //Sending successful response (only data with above filters)
        return res.status(200).send({ status: true, message: "Books list" , data: books });

        } 
        
       
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}
//=====================================================================================================//
// all three (admin,mediator,customer can view all books)
const viewAllBooks = async (req , res) => {
    try {
        // taking the userid from path pharams
        const user_Id=req.params.userId
        const filterQuery = {isDeleted: false , deletedAt: null}
        // validation check of a user id
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (!validateUserId(user_Id)){
            return res.status(400).send({status: false , message: `${user_Id} is not valid type user Id`})
            }
          // checking if the user's role is suitable for that role or not
            let userExist=await UserModel.findOne({_id:user_Id}).select({role:1,_id:0})
            if (!userExist) {
               return res.status(400).send({status: false , message: "No such user exists with this id and role"})
           }
           let Role=userExist.role;
           let validRole= function(value){
               for(let i=0;i<value.length;i++){
                   if(((value[i]=="admin")&& (value[i]=="moderator"))||((value[i]=="admin"))||((value[i]=="moderator")&& (value[i]=="customer") && (value[i]=="admin"))||((value[i]=="customer")&&(value[i]=="admin")) || (value[i]=="customer") ||(value[i]=="moderator")||((value[i])=="customer")&&(value[i]=="moderator")) return true;
               }
               return false;
           }
           if (!validRole(Role)) {
               return res.status(403).send({status: false , message: "You can not do this task"})
           }
          //Fetching books which have the above filters
          const booklist = await BookModel.find({$and : [filterQuery]})
          //If no such book found
          if (Array.isArray(books) && books.length == 0) {
              return res.status(404).send({ status: false, msg: "No books found" })
          }
          //Sending successful response (only data with above filters)
          return res.status(200).send({ status: true, message: "Books list" , data: booklist });
        } 
        
       
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}


module.exports.createBook=createBook;
module.exports.viewParticulerBooks=viewParticulerBooks;
module.exports.viewAllBooks=viewAllBooks;