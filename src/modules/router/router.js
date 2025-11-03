const express = require("express")
const uploadOneFile = require("../../multer/multer")
const { uploadFile, dashboard, uploadFileAndExtract, uploadFileAndExtractAndSummarize, test, uploadFileAndExtractAndGenerateQuiz, register, login, chatAboutDoc, getAllUserQuizDetails, getAllUserSummaryDocuments, postQuizDetails, getAUser, verifyPaymentAndUpgrade, uploadFileAndExtract_Free, uploadFileAndExtractAndGenerateQuiz_Free, chatAboutDoc_Free } = require("../controllers/controller")
const validateUser = require("../../middleware/validateUser")

const router = express.Router()

router.route("/signUp").post(register)
router.route("/signIn").post(login)

router.route("/chat").post(chatAboutDoc)

router.route("/upload-summarize").post( uploadOneFile, validateUser, uploadFileAndExtractAndSummarize)  
router.route("/upload-and-quiz").post(uploadOneFile, uploadFileAndExtractAndGenerateQuiz)  
router.route("/dashboard").get(validateUser, dashboard )
router.route("/quiz/upload").post(validateUser, postQuizDetails) //upload quiz details and score to backend
router.route("/quiz/:userId").get(validateUser, getAllUserQuizDetails )
router.route("/summary/:userId").get(validateUser, getAllUserSummaryDocuments )
router.route("/user/:userId").get(validateUser, getAUser ) //To get one user's details
router.route("/register-paid").post(verifyPaymentAndUpgrade ) //To pay for premium


// 🆓 Free user routes (No token, no save to DB)
// Free routes — no login, no validation
router.post("/free/upload-summarize", uploadOneFile, uploadFileAndExtract_Free);
router.post("/free/upload-and-quiz", uploadOneFile, uploadFileAndExtractAndGenerateQuiz_Free);
router.post("/free/chat", chatAboutDoc_Free);


module.exports = router 