const UserModel = require("../model/userModel")
const jwt = require("jsonwebtoken")

//Creating a validation function
const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) return false 
    if (typeof (value) === "string" && (value).trim().length > 0)  return true 
}

 const isValidRole = function (value) {
    for (let i=0 ; i<value.length ; i++) {
        if ((value[i] == "admin")|| (value[i]=="customer")||(value[i]=="moderator"))  return true
          
    }
    return false;
}


//====================================================================================================//

//First API function(Register)
const createUser = async (req, res) => {
    try {
        //Checking if no data is present in our request body
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "Please enter your details to register" })
        }

        //Checking if user has entered these mandatory fields or not
        const { name, mobile, email, password,role} = data


        if (!isValid(name)) { 
            return res.status(400).send({ status: false, message: "Name is required" }) 
        }

        if (!isValid(mobile)) { 
            return res.status(400).send({ status: false, message: "Mobile is required" })
         }

         //Checking if mobile is unique or not
        let uniqueMobile = await UserModel.findOne({mobile : data.mobile})
        if (uniqueMobile) {
           return res.status(400).send({status: false , message: "Mobile already exists"})
        }

         if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
            }

        //Checking if user entered a valid email or not
        let Email = data.email
        let validateEmail = function (Email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(Email);
        }
        if (!validateEmail(Email)){
        return res.status(400).send({status: false , message: "Please enter a valid email"})
        }

        //Checking if email is unique or not
        let uniqueEmail = await UserModel.findOne({email : data.email})
        if (uniqueEmail) {
            return res.status(400).send({status: false , message: "Email already exists"})
        }

        if (!isValidRole(role)) { 
            return res.status(400).send({ status: false, message: "role is not valid" }) 
        }

        if (!isValid(password)) { 
           return res.status(400).send({ status: false, message: "Password is required" }) 
        }
        
        //Checking if password contains 8-15 characters or not
        let Password = data.password
        let validatePassword = function (Password) {
            return /^[a-zA-Z0-9]{8,15}$/.test(Password);
        }
        if (!validatePassword(Password)){
        return res.status(400).send({status: false , message: "The length of password should be in between 8-15 characters"})
        }

        //If all these validations passed , registering a user
        let UserData = await UserModel.create(data)
        return res.status(201).send({status: true , message: "You're registered successfully", data: UserData })
    
    }
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

//=====================================================================================================//

//Second API function(Login User)
const loginUser = async (req , res) => {
    try {
        //Checking if no data is present in our request
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "Please enter your details to login" })
        }

        //Checking if user has entered these mandatory fields or not
        const { email, password} = data

        if (!isValid(email)) {
             return res.status(400).send({ status: false, message: "Email is required" })
             }  

        if (!isValid(password)) { 
            return res.status(400).send({ status: false, message: "Password is required" }) 
        }

        //Matching that email and password with a user document in our UserModel
        const userMatch = await UserModel.findOne({ email: email, password: password })
        //If no such user found 
        if (!userMatch) {
            return res.status(401).send({ status: false, message: "Invalid login credentials" })
        }

        //Creating a token if email and password matches
        const token = jwt.sign({
            userId: userMatch._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (30*60)
        }, "Secret-Key-given-by-us-to-secure-our-token")
        
        //Setting back that token in header of response
        res.setHeader("x-api-key", token);
        
        //Sending response on successfull login
        return res.status(200).send({ status: true, message: "You are successfully logged in", data: token })
    
    }
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

/* if you are a admin you can ------> create book
                                      view all book
                                      view particuler book

 if you are a customer you can ---------> view all book
 
 if you are a moderator you can -------->view all book
                                         view particuler book

 */
                                      


//Exporting the above API functions 
module.exports.createUser = createUser
module.exports.loginUser = loginUser