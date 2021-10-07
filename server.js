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

// UserSchema with late entries of logs from exercise form
const UserSchema = new Schema({
  username: {type: String, require: true},
  logs: [{
    description: String,
    duration: Number,
    date: String
  }]
});
// To convert object into string literal use toObject whith getter:true at schema level So that you will get only string part of id not new Object(string part)
UserSchema.set("toObject", {getters: true});
let User = mongoose.model("User", UserSchema);
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

let newSetGet = [];
// The get request to /api/users returned all users in array of object with username and _id
app.get("/api/users", (req, res)=>{
  // To get all entries use chain method of module
  User.find().all().exec((err, data)=>{
    if(err){
      console.log(err);
    }
    else{
      // For further operation, we must print what part of object is needed in new object
      for(i = 0; i < data.length; i++){
        newSetGet.push({_id: data[i].id, username: data[i].username, __v: data[i].__v});
      }
      res.send(newSetGet);
    }
  })
});

// To post to /api/users/:_id/exercises . the input from exerceise form and if date is not supplied then use current date
app.post("/api/users/:_id/exercises", (req, res)=>{
  descriptionInput = req.body.description;
  durationInput = parseInt(req.body.duration);
  let d = (req.body.date)?(new Date(req.body.date)):(new Date());
  dateInput = (d.toDateString());
  idInput = req.params._id;
  // For exercise form we have to add exercises subelement of original schema for that first find that instance which is to be update and save that update with addition of data
  User.findById({_id: idInput}, (err, data)=>{
    if(err){
      console.log(err);
      res.end();
    }
    else{
      data.logs.push({
        description: descriptionInput,
        duration: durationInput,
        date: dateInput
      });
      data.save();
      // Response return from post
      res.json({_id: idInput, username: data.username, date: data.logs[0].date, duration: data.logs[0].duration, description: data.logs[0].description});
    }
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
