const express = require("express")
const uploadOneFile = require("../../multer/multer")
const { uploadFile, dashboard, uploadFileAndExtract, uploadFileAndExtractAndSummarize, test, uploadFileAndExtractAndGenerateQuiz, register, login, chatAboutDoc, getAllUserQuizDetails, getAllUserSummaryDocuments, postQuizDetails, getAUser } = require("../controllers/controller")
const validateUser = require("../../middleware/validateUser")

const router = express.Router()

router.route("/signUp").post(register)
router.route("/signIn").post(login)

router.route("/chat").post(chatAboutDoc)

router.route("/upload-summarize").post( uploadOneFile, validateUser, uploadFileAndExtractAndSummarize)  
router.route("/upload-and-quiz").post(uploadOneFile, uploadFileAndExtractAndGenerateQuiz)  
router.route("/dashboard").get(validateUser, dashboard )
router.route("/quiz/upload").post(validateUser, postQuizDetails)
router.route("/quiz/:userId").get(validateUser, getAllUserQuizDetails )
router.route("/summary/:userId").get(validateUser, getAllUserSummaryDocuments )
router.route("/user/:userId").get(validateUser, getAUser )

module.exports = router 