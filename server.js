//   const upload = multer({ storage });
//   // Set up file upload storage (Multer)
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, './uploads');
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + path.extname(file.originalname));
// //   },
// // });

// dotenv.config();
// const PORT = process.env.PORT;
// console.log(PORT);

// // app.use(cors());

// app.get('/routes/documents',async (req, res) => {
//   console.log(req.body);
//   await res.json({ message: 'Document received successfully' });
// });

// // Middleware to parse JSON bodies
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Route to upload a document and assign reviewers/approvers
// app.post('/documents', upload.single('file'), async (req, res) => {
//   const { reviewers, approver } = req.body;
//   const { file } = req;

//   try {
//     const newDocument = new Document({
//       name: file.originalname,
//       file: file.path,
//       reviewers: reviewers.map(id => mongoose.Types.ObjectId(id)),
//       approver: mongoose.Types.ObjectId(approver),
//     });
//     await newDocument.save();

//     // Send emails to reviewers and approvers
//     sendDocumentEmails(reviewers, approver, newDocument);

//     res.status(201).json(newDocument);
//   } catch (err) {
//     res.status(400).json({ error: 'Error uploading document' });
//   }
// });

// // Route to submit a comment on a document
// app.post('/documents/comments', async (req, res) => {
//   const { text, userId } = req.body;
//   const { id } = req.params;

//   try {
//     const newComment = new Comment({ text, userId, documentId: id });
//     await newComment.save();

//     // Update document with new comment
//     const document = await Document.findById(id);
//     document.comments.push(newComment._id);
//     await document.save();

//     // Send email to admin about new comment (future integration)
//     sendCommentNotification(userId, newComment, document);

//     res.status(201).json(newComment);
//   } catch (err) {
//     res.status(400).json({ error: 'Error submitting comment' });
//   }
// });

// // Route to approve or reject a document
// app.post('/documents/:id/status', async (req, res) => {
//   const { status, userId } = req.body;
//   const { id } = req.params;

//   try {
//     const document = await Document.findById(id);
//     if (!document) {
//       return res.status(404).json({ error: 'Document not found' });
//     }

//     if (status === 'Approved' || status === 'Rejected') {
//       document.status = status;
//       await document.save();

//       // Notify approver about the status update
//       sendStatusUpdateNotification(document, status);

//       res.status(200).json(document);
//     } else {
//       res.status(400).json({ error: 'Invalid status' });
//     }
//   } catch (err) {
//     res.status(400).json({ error: 'Error updating document status' });
//   }
// });

import express from "express";
import mongoose from "mongoose";
import review from "./models/review.js";
import DocData from "./models/document.js";
import userSchema from "./models/model.js";
import Document from "./models/document.js";
import multer from "multer";
import User from "./models/User.js";
import Comment from "./models/comments.js";
import bcrypt from "bcrypt";
import fileUpload from "express-fileupload";

import fs from "fs";
const app = express();

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "." + file.mimetype.split("/")[1]
    );
  },
});

// const upload = multer({ storage });

// app.get("/uploaded", upload.single("file"), async (req, res) => {
//   console.log(req.file);
//   res.json(req.file);
// });

// connecting mongo db
mongoose
  .connect(
    "mongodb+srv://root:Root123@medicingcluster.cfdca.mongodb.net/?retryWrites=true&w=majority&appName=medicingCluster"
  )
  .then(() =>{
    // const db = client.db("test");
    // bucket = new GridFSBucket(db, { bucketName: "uploads" });
    console.log("Connected to MongoDB and GridFSBucket initialized.");
  })
  .catch((err) => console.log(err));

// dummy function
app.post("/addDataToDb", async (req, res) => {
  const { name, email, role,Designation,Department,EmployeeID,companyName,userID,status } = req.body;
  try {
    const newData = new userSchema({
      name,
      email,
      role,
      Designation,Department,EmployeeID,companyName,
      userID,
      status:"Created"
    });
    await newData.save();
    return res.json(await userSchema.find());
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/updateStatus",async(req,res)=>{
    try{
      const {email}  = req.body;
      console.log(email)
      const findUser = await userSchema.findOne({email:email});
      if(!findUser){
        return res.status(400).json({error:"user not found"});
      }
      const updateStatus = await userSchema.updateOne(
        {email:email},
        {$set:{status:"Active"}}
      );
      if(updateStatus){
        return res.status(200).json({message:"status updated"});
      }
    }
    catch(err)
    {
      console.log("error",err)
    }

})

app.get("/routes/showUsers", async (req, res) => {
  try {
    return res.json(await userSchema.find());
  } catch (err) {
    console.log(err.message);
  }
});

app.get('/reigeister.html',async(req,res)=>{
  try {
    const file = fs.readFileSync("/reigeister.html", "utf-8");
    return res.send(file);
  } catch (err) {
    console.log("error in getting file line number 524" + err);
  }
  });

  app.get('/forgetPassword.html',async(req,res)=>{
    try {
      const file = fs.readFileSync("/forgetPassword.html", "utf-8");
      return res.send(file);
    } catch (err) {
      console.log("error in getting file line number 524" + err);
    }
    });


import { SMTPClient } from 'emailjs';


// Configure the SMTP client
const client = new SMTPClient({
  user: 'gantasai007@gmail.com', // Your email
  password: 'jjts snww jrdc dajc', // Your email password or app password
  host: 'smtp.gmail.com', // SMTP server (Gmail in this example)
  ssl: true, // Use SSL (or TLS for some servers)
});

// Function to send email

app.post("/sendEmailForget",async(req,res)=>{
  try {
    const { to, otp } = req.body;
    console.log(to,otp)
    const text=`Dear User,

You recently requested to reset your password for your account. To proceed with the password reset, please use the following One-Time Password (OTP):

Your OTP: ${otp} 

If you did not request this password reset, please ignore this email or contact our support team immediately at [support email or phone number].

Best Regards,
MEDICING ENTERPRISES
ADMIN TEAM
`
    
    
    async function sendEmail() {
      try {
        const message = await client.sendAsync({
          text:text,
          from: "gantasai007@gmail.com",
          to: to,
          subject: 'Forget Password OTP',
        });
        console.log('Email sent successfully!', message);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
    sendEmail();
    
    return res.status(200).json({message:"email sent"});
  } catch (err) {
    console.log("error in sending email line number 555" + err);
  }
    })






app.post('/searchUser', async (req, res) => {
  try {
    const {email} = req.body;
    const user = await userSchema.find({ email:email});
    return res.json(user);
  } catch (err) {
    console.log(err)
  }
}
)

app.put("/activeUser",async(req,res)=>{
  try {
    const {id} = req.body;
    const user = await userSchema.updateOne({EmployeeID:id},{$set:{status:"Active"}});
    return res.json(user);
  } catch (err) {
    console.log(err)
  }
})
let bucket;

app.put("/deactiveUser",async(req,res)=>{
  try {
    const {id} = req.body;
    const user = await userSchema.updateOne({EmployeeID:id},{$set:{status:"Deactive"}});
    return res.json(user);
  } catch (err) {
    console.log(err)
  }
})
// import multer from 'multer';
const upload = multer().single('file'); // Middleware to parse file uploads
import { Readable } from 'stream';
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
dotenv.config();
const mongoURI = process.env.MONGO_URI; // Update with your MongoDB connection string
const DBclient = new MongoClient(mongoURI);
const db = DBclient.db("test");
bucket = new GridFSBucket(db, { bucketName: "Documents" });



app.post("/routes/documents/upload",
  async (req, res) => {
    console.log("req.body",req.body)
    const { user,name,file, reviewers, approver, status } = req.body;
    try {


      const titlename = name;
      const approversList = [];
      approversList.unshift(JSON.parse(approver).email);
      let reviewersList = [];
      for(let i=0;i<reviewers.length;i++){
        reviewersList.unshift((reviewers[i]).email);
      }
      console.log("reviwers")
      console.log(reviewersList)


      const newDocument = new Document({
        user:user,
        name: titlename,
        file: file,
        reviewers: reviewersList,
        approver: approversList ,
        status: status,
      });
      await newDocument.save();
      res.status(201).json({
        message: "Document uploaded successfully",
        document: newDocument,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);




app.post("/routes/documents/resend/:_id",upload, async (req, res) => {
  try {
    const { _id } = req.body; // Get the document ID from URL parameters
    const fileName = req.body.fileName; // Get the file name from the request body
    const fileData = req.file; // Get the file from the request
    bucket = new GridFSBucket(db, { bucketName: "documentdatas" });

    if (!fileData || !fileName) {
      return res.status(400).json({ error: "File and file name are required" });
    }

    const fileStream = new Readable();
    fileStream.push(req.file.buffer);
    fileStream.push(null);
    
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
  });
  fileStream.pipe(uploadStream);

  uploadStream.on("error", (err) => {
      console.error("Error uploading file:", err);
      return res.status(500).json({ error: "Failed to upload file" });
  });

  uploadStream.on("finish", async () => {
      console.log("File uploaded successfully:", uploadStream.id);
      const updatedDocument = await DocData.updateOne(
        { _id: _id }, // Match document by ID
        {
          $set: {
            file: uploadStream.id,  // Store file data (or a reference like a Google Drive URL)
            name: fileName, // Store the file name
          }
        }
      );
  });
    // Perform your file handling logic (e.g., upload to Google Drive, save metadata, etc.)
    console.log(updatedDocument);
    console.log("_id",_id)

    if (updatedDocument.modifiedCount === 0) {
      return res.status(404).json({ error: "Document not found or not updated" });
    }

    return res.json({ message: `Document updated successfully with file: ${fileName}` });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/files/:id', (req, res) => {
  const fileId = new ObjectId(req.params.id);
  
  const downloadStream = bucket.openDownloadStream(fileId);

  downloadStream.on('error', () => res.status(404).send('File not found'));
  downloadStream.pipe(res);
});


app.put("/addReviewersDocument", async (req, res) => {
  try {
    const { email,name } = req.body;
    const user = await userSchema.findOne({email: email});
    if(!user){
      return res.status(404).json({message: "User not found"})
      }
      const Doc1 = await DocData.findOne({ name: name });
      if (Doc1.reviewers.includes(email)){
        return res.status(404).json({message: "User already added"})
      }
    const Doc = await DocData.updateOne({ name: name },{ $push: { reviewers: email } });
    return res.json(user);
    } catch (err) {
      console.log(err.message);
      }
})



app.delete("/deleteUserFromFile", async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Remove the email from the 'reviewers' array for the document matching the 'name'
    const user = await DocData.updateOne(
      { name: name },
      { $pull: { reviewers: email } }
    );
    
    return res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/createPassword',async(req,res)=>{
  try{
    const {email, password} = req.body;
    const findUser = await userSchema.findOne({email:email});
    if(!findUser){
      return res.status(400).json({error:"user not found"});
    }
    const updatePassword = await userSchema.updateOne(
      {email:email},
      {$set:{password:password}});
    if(updatePassword){ 
      return res.status(200).json({message:"password updated"});
    }    
  }
  catch(err){
    console.log(err)
  }
})





app.post("/documents/getDocumentName", async (req, res) => {
  try {
    const documentName = await DocData.findOne();
    return res.json({ documentName });
  } catch (err) {
    console.error("Error in /documents/getDocumentName:", err);
    res.status(500).json({ error: "Failed to fetch document name" });
  }
})

app.post("/users/getUsers",async(req,res)=>{
  try {
    const {email} = req.body;
    console.log(email)
    const users = await userSchema.find({email:email});
    return res.json(users);
  } catch (err) {
    console.error("Error in /users/getUsers:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userSchema.findOne({
      $or: [
        { email: email.toLowerCase() },
        { name: email}
      ]
    });
    // console.log("line number 462", user)

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    let isMatch = false;
    console.log(user.password, password);

    console.log(user.password == password);
    if (password == (await user.password)) {
      isMatch = true;
    }
    console.log("line number 470", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
        status: user.status,
        name: user.name
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/routes/users/delete", async (req, res) => {
  const { email } = req.body;
  try {
    return res.json(await userSchema.findOneAndDelete({ email: email }));
  } catch (err) {
    console.log(err.message);
  }
});

app.put("/routes/users/update", async (req, res) => {
  const { email, role } = req.body;
  try {
    return res.json(
      await userSchema.findOneAndUpdate(
        { email: email },
        { role: role, password: email.slice(0, 3) + role.slice(0, 3) }
      )
    );
  } catch (err) {
    console.log(err.message);
  }
});


// dummy function
app.get("/routes/showDocuments", async (req, res) => {
  try {
    res.send(await DocData.find());
    return res.json(await DocData.find());
  } catch (err) {
    console.log(err.message);
  }
});




// to show the log in page
app.get("/index.html", async (req, res) => {
  try {
    const file = fs.readFileSync("/index.html", "utf-8");
    return res.send(file);
  } catch (err) {
    console.log("error in getting file line number 524" + err);
  }
});

app.get("/adminPage.html", async (req, res) => {
  try {
    const file = fs.readFileSync("/adminPage.html", "utf-8");
    return res.send(file);
  } catch (err) {
    console.log("error in getting file line number 524" + err);
  }
});



app.get("/userPage", async (req, res) => {
  try {
   
    const email = req.query.email;
    console.log(email);
    let file = fs.readFileSync("/userPage.html", "utf-8");
  } catch (err) {
    console.error("Error in /reviewer.html route:", err);
    res.status(500)
    .send("<h3>An error occurred while loading the reviewer page.</h3>");
  }
});

app.get("/reviewerPageOpen.html", async (req, res) => {
  try {
   
    const documentName = req.query.documentName || "No email provided";
    let file = fs.readFileSync("/reviewerPageOpen.html", "utf-8");
    file = file.replace("<!-- Dynamic email here -->", documentName);
    res.send(file);
  } catch (err) {
    console.error("Error in /reviewer.html route:", err);
    res
      .status(500)
      .send("<h3>An error occurred while loading the reviewer page.</h3>");
  }
});

app.put("/documents/comment",async(req,res)=>{
  try {
    const {comment,DocumentName,name} = req.body;
    const result = await DocData.updateOne({name},{$push:{comments:comment1}});
    if(result.modifiedCount>0){
      console.log("Document comment updated:",result);
      res.status(200).send("Comment added successfully");
    }else{
      res.status(400).send("Failed to add comment");
    }
  } catch (err) {
    console.error("Error in /reviewer.html route:", err);
}});

app.post('/addComment', async (req, res) => {
  try {
    const { documentName, comments } = req.body;
    
    if (!documentName || !Array.isArray(comments) || comments.length === 0) {
      return res.status(400).send('Invalid data. Please provide a document name and an array of comments.');
    }

    // Check if the document already exists
    const existingDocument = await Comment.findOne({ documentName });

    if (existingDocument) {
      // If the document exists, add the new comment to it
      existingDocument.comments.push(...comments);
      await existingDocument.save();
      return res.status(200).send('Comments added successfully to the existing document.');
    } else {
      // If the document doesn't exist, create a new one with the comments
      const newComment = new Comment({
        documentName,  // Use the correct variable name here
        comments
      });

      await newComment.save();
      return res.status(200).send('New document created and comments added successfully.');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error processing the request');
  }
});


// GET route to fetch all comments
app.post('/getComments', async (req, res) => {
  try {
    const comments = await Comment.find({documentName:req.body.documentName},{documentName:1,comments:1,noComments:1,_id:1  });
    return res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving comments');
  }
});

app.put("/addNoComments", async (req, res) => {
  try {
    const { documentName, email } = req.body;

    // Ensure both documentName and email are provided
    if (!documentName || !email) {
      return res.status(400).send("Document name and email are required");
    }

    // Update the document: push a new email object into noComments array
    const result = await Comment.updateOne(
      { documentName },
      {
        $push: { noComments: email  } // Add a new object with email field
      }
    );

    if (result.modifiedCount > 0) {
      console.log("Document updated:", result);
      res.status(200).send("Email added to noComments successfully");
    } else {
      res.status(400).send("Failed to update document");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.post("/getNoComments", async (req, res) => {
  try {
    const comments = await Comment.find({ documentName: req.body.documentName }, { noComments: 1,_id:0 });
    return res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving comments");
  }
});

app.get("/getUserDetails",async(req,res)=>{
  try {
    const {email} = req.body;
    const user = await userSchema.findOne({email:email});
    if(!user){
      return res.status(404).json({error:"User not found"});
    }
    console.log(res.json(user));
    return res.json(user);
  } catch (err) {
    console.error("Error in /reviewer.html route:", err);
}
})

app.post("/getUserDetails",async(req,res)=>{
  try {
    const {email} = req.body;
    const user = await userSchema.findOne({email:email});
    if(!user){
      return res.status(404).json({error:"User not found"});
    }
    console.log(res.json(user));
    return res.json(user);
  } catch (err) {
    console.error("Error in /reviewer.html route:", err);
}});


app.get("/reviewer.html", async (req, res) => {
  try {
    // Extract email from the query parameter
    const mail = req.query;
    const email = Object.keys(mail)[0] || "No email provided";

    const file = fs.readFileSync("/reviewer.html", "utf-8");
    // return res.send(file);
    const documentName = req.query.documentName;
    res.send(html.replace("documentName", email));
  } catch (err) {
    console.error("Error in /reviewer.html route:", err);
    res
      .status(500)
      .send("<h3>An error occurred while loading the reviewer page.</h3>");
  }
});


app.get("/userPage.html", async (req, res) => {
  try {
    // Extract email from the query parameter
    const email = req.query.email || "No email provided";

    const file = fs.readFileSync("/userPage.html", "utf-8");
    // return res.send(file);
    res.send(file);
  } catch (err) {
    console.error("Error in /reviewer.html route:", err);
    res
      .status(500)
      .send("<h3>An error occurred while loading the reviewer page.</h3>");
  }
});


import path from 'path';

// Middleware for handling file upload
app.use(fileUpload());

// Serve static files (like PDFs)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection

// Define the schema for storing documents
const documentSchema = new mongoose.Schema({
  name: String,
  filePath: String,
  uploadedAt: { type: Date, default: Date.now }
});

// Model for the document
const Document1 = mongoose.model('Document', documentSchema);

// Set up the route for uploading the file
app.post('/upload', (req, res) => {
  if (!req.files || !req.files.pdfFile) {
    return res.status(400).send('No files were uploaded.');
  }

  const pdfFile = req.files.pdfFile;
  const uploadPath = path.join(__dirname, 'uploads', pdfFile.name);

  // Save the file to the uploads folder
  pdfFile.mv(uploadPath, async (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Store the document details in the database
    const newDocument = new Document1({
      name: pdfFile.name,
      filePath: uploadPath
    });
    await newDocument.save();

    res.send('File uploaded and document saved to database.');
  });
});

// Get the list of uploaded documents
app.get('/documents', async (req, res) => {
  const documents = await Document.find();
  res.json(documents);
});



app.get('/files/:id', (req, res) => {
  const fileId = new mongoose.Types.ObjectId(req.params.id);

  // Download file from GridFS
  const downloadStream = gfs.openDownloadStream(fileId);

  downloadStream.pipe(res).on('error', (err) => {
    res.status(404).send('File not found: ' + err.message);
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));


app.get("/reviewerPageOpen", (req, res) => {
  // Access query parameters
  const mail = req.query;
  const email = Object.keys(mail)[0];

  console.log("Received mail:", mail);

  // Example response
  res.json({
    message: "Mail received successfully",
    mail,
  });
});

app.post("/routes/documents/tracking", async (req, res) => {
  try {
    const data = await DocData.find();
    return res.json(data); // Send data as JSON response
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" }); // Send error response
  }
});

app.delete("/routes/documents/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await DocData.findByIdAndDelete(id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// getting reviwer mail
app.get("/reviewer", (req, res) => {
  // Access query parameters
  const mail = req.query;
  const email = Object.keys(mail)[0];

  console.log("Received mail:", mail);

  // Example response
  res.json({
    message: "Mail received successfully",
    mail,
  });
});

app.post("/documents/details", async (req, res) => {
  try {
    const { documentName } = req.body;
    const document = await DocData.findOne({ name: documentName });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (err) {
    console.error("Error in /documents/details:", err);
    res.status(500).json({ error: "Failed to fetch document details" });
  }
});

app.post("/reviwerDoc", async (req, res) => {
  try {
    const {reviewerMail} = req.body;
    const projection = {
            name: 1,
            status: 1,
            reviewers: 1,
            comments: 1,
            signature: 1,
            _id: 1,
          };
      
          // Fetch documents where the given email is a reviewer
          const documents = await DocData.find(
            { reviewers: reviewerMail, status: "pending" },
            projection
          );
      
          // Handle case where the email is not assigned as a reviewer
          if (!documents || documents.length === 0) {
            return res.send(
              `<h3>No documents available for review for the provided email: ${reviewerMail}</h3>`
            );
          }
      
          return res.send(documents);

        }
  catch (err) {
            console.error("Error in getting file line number 751" + err);
          }
  }
  )

// app.post("/documents/details", async (req, res) => {
//   try {
//     const { name } = req.body;
//     const document = await DocData.findOne(
//       { name: name },
//       { name: 1, size: 1, reviewers: 1, signature: 1, comments: 1, _id: 0 }
//     );
//     if (!document) {
//       return res.status(404).send("Document not found");
//     }
//     console.log(document);
//     return res.json(document); // Send the document;
//   } catch (err) {
//     console.error("Error in getting file line number 751" + err);
//   }
// });

app.put("/documents/submitSign", async (req, res) => {
  const { email, signature, name } = req.body;
  try {
    // Find the document to ensure it exists
    const data = await DocData.findOne(
      { name: name },
      { name: 1, signature: 1 }
    );

    if (!data) {
      return res.status(404).send("Document not found");
    }

    // Use $push to append the email to the signature array
    const result = await DocData.updateOne(
      { name: data.name },
      { $push: { signature: email } }
    );

    console.log("Document signature updated", result);
    res.status(200).send("Signature added successfully");
  } catch (err) {
    console.error("error in getting file line number 751" + err);
  }
});

app.put("/documents/commentSign", async (req, res) => {
  try {
    const { email, comment1, name } = req.body;

    // Validate required fields
    if (!email || !comment1 || !name) {
      return res
        .status(400)
        .send("Missing required fields: email, comments, or name");
    }

    // Check if the document exists
    const document = await DocData.findOne({ name }, { name: 1, comments: 1 });

    if (!document) {
      return res.status(404).send("Document not found");
    }

    // Append the comment with email and timestam

    const result = await DocData.updateOne(
      { name },
      { $push: { comments: comment1 } }
    );

    if (result.modifiedCount > 0) {
      console.log("Document comment updated:", result);
      res.status(200).send("Comment added successfully");
    } else {
      res.status(400).send("Failed to add comment");
    }
  } catch (error) {
    console.error("Error in updating comment:", error);
    res.status(500).send("Error updating comment");
  }
});

app.get("/reviewPage", async (req, res) => {
  try {
    const data = await DocData.find({}, { name: 1, size: 1, status: 1 });

    let html = `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reviewer Page</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
    }
    header, footer {
      background-color: #004aad;
      color: #fff;
      padding: 15px 20px;
      text-align: center;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    header .logo img {
      height: 50px;
      margin-right: 10px;
    }
    header .search-bar input {
      padding: 8px;
      border: none;
      border-radius: 5px;
      margin-right: 5px;
    }
    .container {
      max-width: 800px;
      margin-top: 20px;
    }
    .form-group label {
      font-weight: bold;
    }
    .form-group select, .form-group input, .form-group textarea {
      width: 100%;
    }
    .btn-submit, .btn-reset {
      margin-top: 10px;
    }
    .comment-section {
      margin-top: 20px;
    }
  </style>
</head>
<body>

  <!-- Header -->

    <header>
      <h2>Medicing Enterprises - Reviewer Page</h2>
    </header>
    <div class="container">
    <!-- Reviewer Section -->
    <h3>review this document</h3>
      <div style="background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
          <object type="application/pdf" width= "700PX" height="700px" data="file.pdf" ></object>
        <label for="comments">Comments:</label>
        <textarea id="comments" name="comments" rows="4" cols="50"></textarea>
          <div>
            <button id="submitComments" style="margin-right: 10px;background-color: lightgreen;padding :10px;outline:none;border:0.1  px solid black;border-radius:5px; margin-left:10px">Submit Comments</button>
            <button id="resetComments" style="margin-right: 10px;background-color: pink ;padding :10px;outline:none;border:0.1px solid black;border-radius:5px; margin-left:10px">No comments</button>
          <div>
      </div>
    </div>
    </div>
    </div>

    <footer style="position:relative;bottom: 0;width: 100%;">
    <p>© 2024 Medicing Enterprises</p>
  </footer>
    
</body>

<script>
    const comment=document.getElementById("comments");
    const submitComments=document.getElementById("submitComments");
    submitComments.addEventListener("click",function(){
      
  })
</script>
    `;

    return res.send(html);
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/users/add", async (req, res) => {
  try {
    // Log the incoming request body
    console.log("Incoming data:", req.body);

    const { id, userName, userEmail, userRole } = req.body;

    // Validate fields
    if (!id || !userName || !userEmail || !userRole) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists by email
    const userExists = await User.findOne({ email: userEmail });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Generate a hashed password
    const userpassword = userName.slice(0, 3) + userRole.slice(0, 3);
    // Create the new user
    const newUser = new User({
      name: userName,
      email: userEmail.toLowerCase(), // Ensure the email is in lowercase
      role: userRole,
      password: userpassword,
    });

    console.log("Prepared User Data:", newUser);

    // Save the user to the database
    try {
      const savedUser = await newUser.save();
      console.log("User saved:", savedUser);
    } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).json({ message: "Failed to save user", error });
    }

    // Respond with success
    res.status(201).json({
      message: "User added successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// showing the status page
app.get("/status.html", async (req, res) => {
  try {
    const file = fs.readFileSync("status.html", "utf-8");
    return res.send(file);
  } catch (err) {
    console.log("error in getting file line number 814" + err);
  }
});

app.get("/signaturePage.html", async (req, res) => {
  try {
    const file = fs.readFileSync("signaturePage.html", "utf-8");
    return res.send(file);
  } catch (err) {
    console.log("error in getting file line number 814" + err);
  }
});

app.get("/approver.html", async (req, res) => {
  try {

    const file = fs.readFileSync("/approver.html", "utf-8");
    return res.send(file);
  } catch (err) {
    console.log("error in getting file line number 814" + err);
  }
});

app.get("/approver", (req, res) => {
  // Access query parameters
  const mail = req.query;
  const email = Object.keys(mail)[0];

  console.log("Received mail:", mail);

  // Example response
  res.json({
    message: "Mail received successfully",
    mail,
  });
});

app.get("/getDataFromDb", async (req, res) => {
  try {
    return res.json(await userSchema.find());
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/", async (req, res) => {
  try {
    return res.send("hello bro change url");
  } catch (err) {
    console.log(err.message);
  }
});

//mailing
import nodemailer from "nodemailer";
import dotenv from "dotenv";

//sending emails
app.post("/routes/notifications/send", async (req, res) => {
  let documentLink = "https://css4.pub/2015/icelandic/dictionary.pdf";
  dotenv.config();
  res.send(req.body);
  console.log("hello i am email sender");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "smtp.gmail.com", // You can change this to any other service (e.g., SendGrid, Mailgun)
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: "jjts snww jrdc dajc", // Your email password (or app password for Gmail)
    },
  });
  const sendEmail = async (to, subject, text) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${info.response}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
    }
  };
  const sendReviewEmail = async (reviewerEmail, documentLink) => {
    const subject = "Document Review Request";
    const text = `Hello Sir/Madam,

We have a request for reviewing the document. Please review the document at the following link: ${documentLink}.

If everything is correct, please sign. Otherwise, feel free to leave a comment.

Regards,
Medicing Enterprises`;
    await sendEmail(reviewerEmail, subject, text);
  };
  const sendApproveEmail = async (approverEmail, documentLink) => {
    const subject = "Document Approval Request";
    const text = `Hello Sir/Madam,

We have a request for approving the document. Please approve the document at the following link: ${documentLink}.

If everything is correct, please approve the document. If not, please reject it.

Regards,    
Medicing Enterprises`;
    await sendEmail(approverEmail, subject, text);
  };
  const sendDocumentUploadNotification = async (reviewers, approvers) => {
    console.log("Sending emails to reviewers and approvers...");
    await Promise.all([
      sendReviewEmail(reviewers, documentLink),
      sendApproveEmail(approvers, documentLink),
    ]);
    console.log("All notification emails sent.");
  };
  const { reviewers, approvers } = req.body;
  await sendDocumentUploadNotification(reviewers, approvers);
});

// app.get("/approver.html", async (req, res) => {
//   try {
//     const projection = {
//       _id: 1,
//       name: 1,
//       reviewers: 1,
//       signature: 1,
//       comments: 1,
//       status: 1,
//     };
//     const cursor = DocData.find({}, projection);

//     const data = await cursor;
//     let html1 = ``;
//     console.log(data);
//     for (const fruit of data) {
//       if (
//         fruit.reviewers.length === fruit.signature.length &&
//         fruit.status === "pending" &&
//         fruit.comments.length === 0
//       ) {
//         console.log(fruit);
//         html1 += `<li style="gap:10px;">
//       <a href="" id='${fruit._id}'>${fruit.name}</a>
//       <button class="btn btn-primary" onclick=functionApprove() style="margin-right: 10px;backgound-color: green;outline:none;border:0.5px solid black;border-radius:5px; margin-left:10px">Approve</button>
//       <button class="btn btn-danger" onclick=functionReject() style="margin-right: 10px;backgound-color: red;outline:none;border:0.5px solid black;border-radius:5px">Reject</button>
//       </li>`;
//       }
//     }

//     let html = "";

//     html += `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Approver Page - Medicing Enterprises</title>
//   <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       background-color: #f4f4f9;
//     }
//     header, footer {
//       background-color: #004aad;
//       color: #fff;
//       padding: 15px 20px;
//       text-align: center;
//     }
//     header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//     }
//     header .logo img {
//       height: 50px;
//       margin-right: 10px;
//     }
//     header .search-bar input {
//       padding: 8px;
//       border: none;
//       border-radius: 5px;
//       margin-right: 5px;
//     }
//     .container {
//       max-width: 1000px;
//       margin-top: 20px;
//     }
//     .form-group label {
//       font-weight: bold;
//     }
//     .form-group select, .form-group input, .form-group textarea {
//       width: 100%;
//     }
//     .btn-submit, .btn-reset {
//       margin-top: 10px;
//     }
//     .status-section {
//       margin-top: 20px;
//     }
//     .comment-section {
//       margin-top: 20px;
//     }
//     .signature-section {
//       margin-top: 20px;
//     }
//   </style>
// </head>
// <body>

//   <!-- Header -->

//     <header>
//       <h2>Medicing Enterprises - Approver Page</h2>
//       <hr>
//     </header>


//     <div class="container">
//     <!-- Document List -->
//     <h3>Documents Assigned to You</h3>
//     <div id="documentList"></div>

//     <!-- Success Message -->
//     <div id="successMessage" style="display: none;">
//       <p class="alert alert-success">Document approved successfully!</p>

//     </div>
//     <div>
//         <!--   <table border='1' style='width:100%'>
        
//         // </table> -->

//         <ul id="documentList">DocumentList
//         ${html1}
//         </ul>
//         </div>
//         </div>


//   <footer class="mt-5" style="position:relative;bottom: 0;width: 100%;">
//     <p>© 2024 Medicing Enterprises</p>
//   </footer>

//   <script>
// const li = document.getElementsByTagName("li");
// let k = li.length;
// function functionReject() {
//   for (let i = 0; i < k; i++) {
//     li[0].remove();
//     console.log(i);
//   }
//   documentList.innerHTML = "";
//   alert("document is rejected");
//   fetch("/routes/documents/rejected", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
// };


// function functionApprove() {
//     for (let i = 0; i < k; i++) {
//       li[0].remove();
//       console.log(i);
//     }
//     alert("document is approved");

//     fetch("/routes/documents/approved", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   }    
    

//   </script>
//   </body>
// `;
//     return res.send(`${html + ""}`); //await cursor);
//   } catch (err) {
//     console.log(err.message);
//   }
// });

app.put("/routes/documents/approved", async (req, res) => {
  try {
    const { Docname , email } = req.body;
    console.log(req.body);
    console.log(Docname,email);
    // Use await to ensure the update operation completes
    const result = await DocData.updateMany(
      { name:Docname }, // Query filter
      { $set: { status: `Approved by ${email}` } } // Update operation
    );

    console.log("Documents approved");
    // Send a response to the client with the result
    res.status(200).json({ message: "Documents approved", result });
  } catch (error) {
    console.error("Error updating documents:", error);
    // Send an error response to the client
    res.status(500).json({ error: "Error updating documents" });
  }
});

app.post("/viewAllDocuments", async (req, res) => {
  try{
    const result = await DocData.find().toArray();
    console.log(result);
    res.send(result);
  }catch(err){
    console.log(err.message);
  }
  }
)


app.get("/documentstatus", async (req, res) => {
  const pro = { name: 1, status: 1, reviewers: 1, approver: 1, _id: 0 };
  const documents = await DocData.find({}, pro);

  let htm1 = "";
  for (let doc of documents) {
    htm1 += `
        <tr>
        <td>${doc.name}</td>
        <td>${doc.reviewers}</td>
        <td>${doc.approver}</td>
        <td>${doc.status}</td>
        </tr>`;
  }

  let html = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Page</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <style>

header, footer {
      background-color: #004aad;
      color: #fff;
      padding: 15px 20px;
      text-align: center;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
    }
    .container {
      max-width: 800px;
      margin-top: 20px;
    }
    .form-group label {
      font-weight: bold;
    }
    .form-group select, .form-group input, .form-group textarea {
      width: 100%;
    }
    .btn-submit, .btn-reset {
      margin-top: 10px;
    }
    .comment-section {
      margin-top: 20px;
    }
    #documentsTable{
      width: 100%;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    }
    th,td{
      padding: 5px;
    }
  </style>
</head>
<body>

  <!-- Header -->

    <header>
      <h2>Medicing Enterprises - Document Status Page</h2>
      <hr>
    </header>
    <div class="container" style="max-width:1000px">
    <!-- Reviewer Section -->
    <h3>Assigned Documents</h3>
    <div id="documentsList">
      <table id="documentsTable" border="1">
        <thead>
        <tr style="background-color: #004aad; color: #fff;">
          <th>DocumentName</th>
          <th>reivewer</th>
          <th>Approver</th>
          <th>approver/rejected</th>
        </tr>
      </thead>
      <tbody id="document-tracking">
        ${htm1}
      </tbody>

        
      </table>
    </div>
    <!-- Success Message -->
    <div id="successMessage" style="display: none;">
      <p class="alert alert-success">Your comments/signature have been submitted!</p>
    </div>
  </div>

  <footer class="mt-5" style="position:relative ;bottom: 0;width: 100%;">
    <p>© 2024 Medicing Enterprises - All Rights Reserved</p>
  </footer>
 `;
  res.send(html);
});

app.post("/routes/documents/rejected", async (res, req) => {
  try {
    const { Docname , email } = req.body;
    console.log(req.body);
    console.log(Docname,email);
    // Use await to ensure the update operation completes
    const result = await DocData.updateMany(
      { name:Docname }, // Query filter
      { $set: { status: `Rejected by ${email}` } } // Update operation
    );

    console.log("Documents Rejected");
    // Send a response to the client with the result
    res.status(200).json({ message: "Documents Rejected", result });
  } catch (error) {
    console.error("Error updating documents:", error);
    // Send an error response to the client
    res.status(500).json({ error: "Error updating documents" });
  }
});

//   dotenv.config();
//   // Create a reusable transporter object using the default SMTP transport
//

//   // Function to send email
//

//     try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log(`Email sent to ${to}: ${info.response}`);
//     } catch (error) {
//       console.error(`Error sending email to ${to}:`, error);
//     }
//   };
//   const sendReviewEmail = async (reviewerEmail, documentLink) => {
//     const subject = "Document Review Request";
//     const text = `Hello Sir/Madam,

// We have a request for reviewing the document. Please review the document at the following link: ${documentLink}.

// If everything is correct, please sign. Otherwise, feel free to leave a comment.

// Regards,
// Medicing Enterprises`;
//     await sendEmail(reviewerEmail, subject, text);
//   };

//   // Function to send email to approvers
//   const sendApproveEmail = async (approverEmail, documentLink) => {
//     const subject = "Document Approval Request";
//     const text = `Hello Sir/Madam,

// We have a request for approving the document. Please review and approve/reject the document at the following link: ${documentLink}.

// If everything is correct, please approve the document. If not, please reject it.

// Regards,
// Medicing Enterprises`;
//     await sendEmail(approverEmail, subject, text);
//   };

//   // Function to send email notifications for document upload
//   const sendDocumentUploadNotification = async (
//     reviewers,
//     approvers,
//     documentLink) => {
//     console.log("Sending emails to reviewers and approvers...");
//     await Promise.all([
//       ...reviewers.map(({ email }) => sendReviewEmail(email, documentLink)),
//       ...approvers.map(({ email }) => sendApproveEmail(email, documentLink)),
//     ]);
//     console.log("All notification emails sent.");
//   };

//   // Function to resend email if document has comments (in case of rejection or comments from reviewers)
//   const resendEmails = async (reviewers, approvers, documentLink) => {
//     console.log("Resending emails due to comments...");
//     await sendDocumentUploadNotification(reviewers, approvers, documentLink);
//     console.log("Resent all emails successfully.");
//   };
// });

app.post("/getUsersDetails",async(req,res)=>{
    try{
      console.log(req.body);
        const {email} = req.body;
        const result = await userSchema.find({email:email});
        // console.log(result);
        res.status(200).json(result); 
        return res.json(result);
    }catch(error){
        console.log(error);
    }
    })



app.post("/searchUsers", async (req, res) => {
  try {
    // Perform partial match using regex for email, name, or EmployeeID
    const users = await userSchema.find({
      $or: [
        { email: { $regex: req.body.search, $options: 'i' } },
        { name: { $regex: req.body.search, $options: 'i' } },
      ],
      // Exclude users with the role 'user'
      role: { $ne: 'user' }
    });

    // Return the matched users
    return res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ message: "Server error" });
  }
});



app.get("/getUsers", async (req, res) => {
  const users = await userSchema.find();
  return await res.json(users);
});

// app.get("/getUser/:id", async (req, res) => {
//   const { id } = req.params;
//   const user = await userSchema.findById(req.params.id);
//   return await res.json(user);
// });

// Start the server
// app.listen(3000, (req, res, next) => {
//   console.log(`Server is running on http://localhost:${3000}`);
//   next;
// });

app.get('/demo2.html', (req, res) => {
  const file = fs.readFileSync('/demo2.html', "utf-8");
  
  // Set the correct Content-Type for an HTML file
  res.setHeader("Content-Type", "text/html");
  return res.send(file);
});


// // Helper function to send email when a comment is submitted
function sendCommentNotification(userId, comment, document) {
  User.findById(userId, (err, user) => {
    if (err) console.error(err);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Comment on Document ${document.name}`,
      text: `${user.name} has submitted a comment: "${comment.text}" on document: ${document.name}.`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error(err);
      else console.log("Admin notified about new comment");
    });
  });
}

// Helper function to send emails to reviewers and approvers
function sendDocumentEmails(reviewers, approver, document) {
  // Send email to all reviewers
  reviewers.forEach((email) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Document for Review",
      text: `You have been assigned a document for review. Please review and sign it at the following link: /reviewer/${document._id}`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error(err);
      else console.log(`Email sent to reviewer: ${email}`);
    });
  });

  // Send email to approver
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: approver,
    subject: "Document for Approval",
    text: `You have been assigned a document for approval. Please review and approve/reject it at the following link: /approver/${document._id}`,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error(err);
    else console.log(`Email sent to approver: ${approver}`);
  });
}
