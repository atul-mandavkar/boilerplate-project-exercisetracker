const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// To connect to mongodb via mongoose
const mongoose = require("mongoose");
const {Schema} = require("mongoose");
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const UserSchema = new Schema({
  username: {type: String, require: true}
});
// To convert object into string literal use toObject whith getter:true at schema level So that you will get only string part of id not new Object(string part)
UserSchema.set("toObject", {getters: true});
const User = mongoose.model("User", UserSchema);
let UserNew;

let usernameInput, idInput, descriptionInput, durationInput, dateInput;

// pOST TO /api/users with form data username to create new user
const bodyParser = require("body-parser");
// As we need name from input after posting
app.use(bodyParser.urlencoded({extended: false}));
// The response from post is an object with username and _id . For automatically getting id we used mongodb database
app.post("/api/users", (req, res)=>{
  usernameInput = req.body.username;
  // if to check whether input is not blank
  if(usernameInput != ""){
    UserNew = new User({
      username: usernameInput
    });
    UserNew.save();

    // To get return response from post
    res.json({username: UserNew.username, _id: UserNew.id});
  }
  // if input is blank
  else{
    res.send("path \'username\' is required")
  }
});

// The get request to /api/users returned all users in array of object with username and _id
app.get("/api/users", (req, res)=>{
  // To get all entries use chain method of module
  User.find().all().exec((err, data)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(data);
    }
  })
});

// For exercise form we have to make new module and it's casting
const exerciseSchema = new Schema({
  id: {type: String, require: true},
  username: String,
  date: String,
  duration: Number,
  description: String
});

// To post to /api/users/:_id/exercises . the input from exerceise form and if date is not supplied then use current date
app.post("/api/users/:_id/exercises", (req, res)=>{
  descriptionInput = req.body.description;
  durationInput = req.body.duration;
  let d = (req.body.date)?(new Date(req.body.date)):(new Date());
  dateInput = (d.toDateString());
  idInput = req.params._id;
  console.log("id is " + idInput);
  console.log("description is " + descriptionInput);
  console.log("duration is " + durationInput);
  console.log("date is " + dateInput);


  // To get response from the post
  res.end();
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
