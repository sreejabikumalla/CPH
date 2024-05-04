const express = require('express')
const app = express()
const port = 5000
const cors=require('cors');
const mongoDB = require("./db")
const u = require('./models/User')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = "myNameIsCampusPlacementHubWebsite"
mongoDB();
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());

app.use(express.json())
app.use('/api',require("./Routes/CreateUser"))
app.get('/', (req, res) => {
  res.send('Hello World!')
})

const Uschema=new mongoose.Schema({
  username:{type:String},
  password:{type:String},
  securityquestion:{type:String}
})
const UModel=mongoose.model('UModel',Uschema)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
app.post('/register', async (req, res) => {
  let success = false;
  const { username, password } = req.body;  
  try {
    let user = await UModel.findOne({ username });   
    if (!user) {
      return res.status(400).json({ success, error: "Try Log in with correct credentials" });
    }
    else if (!(user.password == password)) {
      return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
      
    }
    else{
      res.json({ success: true })
    }
    
  } catch (error) {
    console.error(error.message)
    res.send("Server Error")
  }
});
app.post('/Add',async(req,res)=>
{
  try {
    const newP = new UModel({
      username: req.body.username,
      password: req.body.password,
      securityquestion: req.body.securityquestion, // Changed from 'type'
   
    });
    await newP.save();
    res.send({ success: true });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.send({ success: false });
  }
});
// app.post('/loginuser', async (req, res) => {
//   let success = false
//   const { email, password } = req.body;
//   console.log(email, password)
//   try {
//     let user = await u.findOne({ email });
//     console.log(email, password)
//     if (!user) {
//       return res.status(400).json({ success, error: "Try Log in with correct credentials" });
//     }
//     if (!(user.password == password)) {
//       return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
//     }
//     res.json({ success: true })
//   } catch (error) {
//     console.error(error.message)
//     res.send("Server Error")
//   }
// })
app.post(
  '/loginuser',
  // body("email", "Invalid Email").isEmail(),
  // body("password", "Invalid Password").isLength({ min: 5 }),
  async (req, res) => {
    let email = req.body.email;
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
    try {
      let userData = await u.findOne({ email });
      //console.log(userData.email,userData.password);
      //console.log(req.body.email,req.body.password)
      if (!userData) {
        return res
          .status(400)
          .json({ errors: "Try logging in with correct credentials" });
      }

      const pwdCompare = await bcrypt.compare(req.body.password,userData.password);
      if (!pwdCompare) {
        return res
          .status(400)
          .json({ errors: "Try logging in with correct credentials" });
      } 
      
      const data={
        user:{
          id:userData.id
        }
      }
      const authToken = jwt.sign(data,jwtSecret)
      return res.json({ success: true , authToken:authToken});
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  }
);
const Anschema = new mongoose.Schema({
  companyName:{type:String},
  companyemail: { type: String },
  description: { type: String },
  companyType: { type: String },
  websiteUrl: { type: String },
});

const NotModel = mongoose.model('NotModel', Anschema)
app.post('/company', async (req, res) => {
  try {
    const newP = new NotModel({
      companyName: req.body.companyName,
      companyemail: req.body.companyemail,
      description: req.body.description,
      companyType: req.body.companyType, 
      websiteUrl: req.body.websiteUrl,
    });
    await newP.save();
    res.send({ success: true });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.send({ success: false });
  }
});
app.get('/companyGet',async(req,res)=>
{try {
  const notes = await NotModel.find();
  res.json(notes);
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Internal Server Error' });
}
});