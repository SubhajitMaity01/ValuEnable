const jwt = require("jsonwebtoken")
const BookModel = require("../model/bookModel")

//Creating Authentication feature for our books API
const authentication = async function (req, res, next) {
    try {
        //Checking if "x-api-key" is present in request header or not
        let token = req.headers["x-api-key"];
        if (!token) {
            return res.status(400).send({ status: false, message: "You need to login to perform this task" })
        }

        //Checking if token is valid or not
        let decodedtoken = jwt.verify(token, "Secret-Key-given-by-us-to-secure-our-token")
        if (!decodedtoken){
            return res.status(401).send({ status: false, message: "Token is invalid" })
        }
        
        //Checking if token expired or not
        let expiration = decodedtoken.exp
        let tokenExtend = Math.floor(Date.now() / 1000) 
        console.log(tokenExtend - expiration)
        if (expiration < tokenExtend){
            return res.status(401).send({ status: false, message: "Token expired" })
        }

        next();
    }
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}
//======================================================================================================//

//Exporting the above authentication & authorisation functions
module.exports.authentication = authentication