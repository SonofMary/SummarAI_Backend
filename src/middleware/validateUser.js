const jwt = require("jsonwebtoken")


const validateUser = (req, res, next) => {
    try {
         const token = req.headers.authorization.replace("Bearer ", "")

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY)

    console.log("middleware: ", decodedData)

    req.userData = decodedData
    next()
        
    } catch (error) {
        return res.status(500).json({
            message: "Authentication failed"
        }) 
        
    }
    
   
}

module.exports = validateUser