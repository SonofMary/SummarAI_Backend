const express = require("express")
const app = express()
const multer = require("multer")
const cors = require("cors")
const path = require("path")

app.use(express.json())
app.use(cors())

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/tmp/")
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb)=> {
        const allowedTypes = [".pdf", ".docx"]
        const ext = path.extname(file.originalname.toLocaleLowerCase())

        if(allowedTypes.includes(ext)) {
            cb(null, true)
        } else {
            cb(new Error("File not allowed, Only Pdf and Docx files are allowed"), false) 
        }
    }
})

const uploadOneFile = upload.single("file")

module.exports = uploadOneFile