const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
        title: {
            type: String,
            required: "title is required",
            unique: true,
            trim: true
            },
        userId: {
            type:ObjectId,
            required:"User Id is required",
            ref: 'User',
            trim: true
            },
        category: {
            type: String,
            required: "Category is required",
            trim: true
            },
       
        deletedAt: {
            type: Date
        }, 
        isDeleted: {
            type: Boolean, 
            default: false
        },
       
        releasedAt: {
            type: Date,   // format("YYYY-MM-DD")
            required: "releasedAt is required", 
            trim: true
        }

},{ timestamps: true })

module.exports = mongoose.model('assesmentBooks',bookSchema)