const mongoose = require("mongoose")

const QuizSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    documentTitle: String,
    score: Number,
    totalQuestions: Number

}, {timestamps: true})

module.exports = mongoose.model("QuizSchema", QuizSchema)