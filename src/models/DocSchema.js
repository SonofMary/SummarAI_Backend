const mongoose = require("mongoose")

const DocSchema = new mongoose.Schema({
   filename: String,
  summary: String,
  content: String, // full extracted text
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    // required: true 
  },
},
    {timestamps: true}
)
module.exports = mongoose.model("DocsUploaded", DocSchema)

   