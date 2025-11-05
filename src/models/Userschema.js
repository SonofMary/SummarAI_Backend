const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
   email: {
         type: String,
         require: true,
        //  unique: true
     },
     password: {
         type: String,
         required: false
     },
     fullName: {
         type: String,
     },
     isPremium: {
        type: Boolean,
        default: false
     }
},
    {timestamps: true}
)
module.exports = mongoose.model("User", userSchema)