const userschema = require("../../models/Userschema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pdfParse = require("pdf-parse")
const mammoth = require("mammoth")
const path = require("path")
const fs = require("fs")
const axios = require("axios");
const DocsUploaded = require("../../models/DocSchema");
const QuizSchema = require("../../models/QuizSchema")
const { response } = require("express");

require("dotenv").config()

let chatDocument = ''

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    return res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
      path: req.file.path,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await userschema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new userschema({ email, password: hashPassword, fullName });
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: newUser._id, email: newUser.email, fullName: newUser.fullName }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  //Check if user already exists

  const user = await userschema.findOne({ email });

try {

    
  if (!user) {
    return res.status(400).json({
      message: "User does not exists",
    });
  }

  //Check Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid Password",
    });
  }
  const jwtToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY, {expiresIn: "1d"});
  console.log("jwtToken", jwtToken)

  return res.status(200).json({
    success: true,
    token: jwtToken,
    user
  })

    
} catch (error) {
    return res.status(500).json({
        message: error.message
    })
    
}

};

const postQuizDetails = async(req, res) => {
  const {owner, documentTitle, totalQuestions, score } = req.body

  try {
    const quizDetails = new QuizSchema({
      owner, documentTitle, totalQuestions, score
    })

    const userQuizDetail = await quizDetails.save()

    return res.status(201).json({success: true, message: "User Score successfully saved", data: userQuizDetail})
  } catch (error) {
    return res.staus(500).json({success: false, message: error.message})
  }
}

const getAllUserQuizDetails = async (req, res) => {

  try {
      const quizDetails = await QuizSchema.find(req.params.userId)

  if(!quizDetails) {
    return res.status(400).json({
      success: false,
      message: "No Quiz Found"
    })
  }

  return res.status(200).json({
    success: true,
    data: quizDetails
  })
  } catch (error) {
   return res.status(500).json({
      success: false,
      message: error.message
    })
    
  }

}


const getAllUserSummaryDocuments = async (req, res) => {

  const userId = req.params.userId

  try {
      const summaryDetails = await DocsUploaded.find({owner: userId})

  if(!summaryDetails) {
    return res.status(400).json({
      success: false,
      message: "No Summaries Found"
    })
  }

  return res.status(200).json({
    success: true,
    data: summaryDetails
  })
  } catch (error) {
   return res.status(500).json({
      success: false,
      message: error.message
    })
    
  }

}
const dashboard = async (req, res) => {
    return res.status(200).json({
        data: req.userData
    })
}
//Function for summarizing pdf and docx
 async function extractTextPdfDocx(filepath) {


    const ext = path.extname(filepath).toLowerCase()

    if(ext === ".pdf") {
        const dataBuffer =  fs.readFileSync(filepath)
        const data = await pdfParse(dataBuffer)
        console.log("data from function (pdf)", data)

        return data.text

    } else if(ext === ".docx"){ 
        const result = await mammoth.extractRawText({path: filepath})
        console.log("result from function (docx)", result)
        return result.value

    } else {
        throw new Error("Unsupported file format")
    }



 }

 async function summarizeTextHugginFaceApi() { 

    try {
        const response = await axios.post("https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6?wait_for_model=true", {inputs: `Amara always stayed up late, not because she liked the silence, but because she feared it. Every night, the power in her small town flickered, then disappeared. The darkness felt alive, like it pressed against her window, waiting.

One night, when the light went out as usual, her old lantern refused to spark. Panic rose in her chest—until a tiny glow appeared in the corner of the room. A firefly, brighter than any she had ever seen, hovered near her face. Then another. And another.

Within seconds, dozens filled her room, weaving glowing patterns in the air. They lit her path to the door, down the creaking stairs, and out into the night.`}, {headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`
        },
    })

    console.log(response.data)
    return response.data[0]?.summary_text 
    } catch (error) {
        console.log("Error summarizing", error.message)
        throw new Error("Error summarizing")
        
    }
    
    
 }


 const uploadFileAndExtract = async (req, res) => {

    try {

         if(!req.file) {
        return res.status(400).json({message: "No file uploaded"})
    }

    //create a variable for file path

    const filepath = req.file.path 

    const extractedText = await extractTextPdfDocx(filepath) 

    return res.status(200).json({
        message: 'File uploaded and extracted successfully',
        file: req.file,
        extractedText
    })
        
    } catch (error) {
        return res.status(500).json({
        message: error.message
    }) 
    }
   
 }

 const uploadFileAndExtractAndSummarize = async (req, res) => {

    try {

         if(!req.file) {
        return res.status(400).json({message: "No file uploaded"})
    }

    //create a variable for file path

    const filepath = req.file.path 

    const extractedText = await extractTextPdfDocx(filepath) 

    console.log("extractedText", extractedText)
    chatDocument = extractedText

    console.log("chat DOCUMENT", chatDocument)

    // const summarizedText = await summarizeTextHugginFaceApi()

    const summarizedText = await summarizeChunk(extractedText)
    console.log('summarized text:', summarizedText)

    const savedDocument = new DocsUploaded({
      filename: req.file.originalname,
      content: extractedText,
      summary: summarizedText,
      owner: req.userData.userId
    })



    const savedDoc = await savedDocument.save()


    return res.status(200).json({
        message: 'File uploaded and extracted successfully',
        file: req.file,
        extractedText,
        summarizedText,
        savedDoc
    })
        
    } catch (error) {
        return res.status(500).json({
        message: error.message,
        success: false,
        error
    }) 
    }
   
 }

 const uploadFileAndExtractAndGenerateQuiz = async (req, res) => {

    try {

         if(!req.file) {
        return res.status(400).json({message: "No file uploaded"})
    }

    //create a variable for file path

    const filepath = req.file.path 

    const extractedText = await extractTextPdfDocx(filepath) 

    // const summarizedText = await summarizeTextHugginFaceApi()

    const quiz = await generateQuiz(extractedText)
    console.log("quiz>>>>>", quiz)

    return res.status(200).json({
        message: 'File uploaded and extracted successfully',
        file: req.file,
        extractedText,
        quiz
    })
        
    } catch (error) {
        return res.status(500).json({
        message: error.message
    }) 
    }
   
 }

//  const test = async (req, res) => {
//   try {
//     // Step 1: extract text
//     const dataBuffer = fs.readFileSync(req.file.path);
//     const pdfData = await pdfParse(dataBuffer);
//     const text = pdfData.text;

//     // Step 2: chunk text (basic split by length)
//     const chunks = text.match(/.{1,1500}/gs);

//     // Step 3: summarize each chunk with DeepSeek via OpenRouter
//     let summaries = [];
//     for (const chunk of chunks) {
//       const response = await axios.post(
//         "https://openrouter.ai/api/v1/chat/completions",
//         {
//           model: "deepseek-chat",
//           messages: [{ role: "user", content: `Summarize:\n\n${chunk}` }],
//         },
//         {
//           headers: {
//             "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       summaries.push(response.data.choices[0].message.content);
//     }

//     // Step 4: merge summaries into one doc
//     const finalSummary = summaries.join("\n\n");

//     // Step 5: generate PDF summary
//     const doc = new PDFDocument();
//     res.setHeader("Content-Type", "application/pdf");
//     doc.pipe(res);
//     doc.fontSize(14).text("PDF Summary", { align: "center" });
//     doc.moveDown();
//     doc.fontSize(12).text(finalSummary, { align: "left" });
//     doc.end();

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error summarizing PDF");
//   }
// }

// Summarize chunks using DeepSeek
async function summarizeChunk(textChunk) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:  "z-ai/glm-4.5-air:free",
        messages: [
          {
            role: "system",
            content: "You are an intelligent summarization AI. Summarize the given text accurately and concisely while keeping the core ideas intact. Properly format the result with adequate spacing and a little explanation for  each point.",
          },
          {
            role: "user",
            content: `Summarize this text:\n\n${textChunk}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`API Error: ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();
    console.log("summarized text:", summary);
    return summary;

  } catch (error) {
    console.error("Error summarizing chunk:", error.message);
    return null;
  }
}


async function chatAboutDoc(req, res) {

  const {message} = req.body

  if(!chatDocument) {
    return res.status(400).json({
      message: "No uploaded document to chat with"
    })
  }

  try{
const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "z-ai/glm-4.5-air:free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that answers questions and discusses documents clearly and concisely. Keep responses short like a chatty way but still very resourceful",
          },
          {
            role: "user",
            content: `Document:\n${chatDocument}\n\nUser: ${message}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data?.choices?.[0]?.message?.content || "No reply.";

    res.json({ reply: aiReply });
  }
 
 
  catch (error) {
    console.error("Chat error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};


async function generateQuiz(chunk) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    //   "HTTP-Referer": "https://yourdomain.com",
    //   "X-Title": "PDF Summarizer"
    },
    body: JSON.stringify({
       model: "z-ai/glm-4.5-air:free",
      messages: [
        {
          role: "system",
          content:"You are a helpful assistant that creates educational quizzes."
        },
        {
          role: "user",
          content: `Create 5 multiple-choice quiz questions from this text. 
          Format the output as valid JSON like this:
          [
            {
              "question": "What is ...?",
              "options": ["A", "B", "C", "D"],
              "answer": "option"
            }
          ]

          Text: ${chunk}`
        }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
  





    






module.exports = { uploadFile, dashboard, uploadFileAndExtract, uploadFileAndExtractAndSummarize, uploadFileAndExtractAndGenerateQuiz, register, login, chatAboutDoc, getAllUserQuizDetails, getAllUserSummaryDocuments, postQuizDetails};
