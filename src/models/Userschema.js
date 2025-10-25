const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
   email: {
         type: String,
         require: true,
        //  unique: true
     },
     password: {
         type: String,
         required: true
     },
     fullName: {
         type: String,
     }
},
    {timestamps: true}
)
module.exports = mongoose.model("User", userSchema)