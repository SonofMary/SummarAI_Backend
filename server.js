const express = require("express")
const app = express()
const multer = require("multer")
const cors = require("cors")
const router = require("./src/modules/router/router")
require("dotenv")
const connectDB = require("./src/db/dbConnection")

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("Server is running")
})




//Connect DB
connectDB()

//Server route
app.use("/summarai", router)

app.listen(3000, (req, res)=> {
    console.log("Server is running on http://localhost:3000")
})