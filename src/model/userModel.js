const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
   
    name:{
        type: String,
        required: "name is required",
        trim: true
    },
    role:{
        type: [String],
        required:"role is required",
    },
    mobile:{
        type:String,
        required: "mobile is required",
        unique:true,
    },
    email:{
        type: String,
        required: "email is required",
        unique: true,
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: "PLease enter a valid email",
        }
    },
    password: {
        type: String,
        required: "password is required",
        validator: function (password) {
            return /^[a-zA-Z0-9]{8,15}$/.test(password);
        },
        message: "The length of password should be in between 8-15 characters",
    }
   
    
},{ timestamps: true });

module.exports = mongoose.model('assesmentUser', usersSchema)