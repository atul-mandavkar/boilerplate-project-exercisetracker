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
  username: {type: String, require: true},
  _id: Number
});
const User = mongoose.model("User", UserSchema);
let UserNew;

let usernameInput, idInput;

// pOST TO /api/users with form data username to create new user
const bodyParser = require("body-parser");
// As we need name from input after posting
app.use(bodyParser.urlencoded({extended: false}));
app.post("/api/users", (req, res)=>{
  usernameInput = req.body.username;

// The response from post is an object with username and _id . For automatically getting id we used mongodb database
  UserNew = new User({
    username: usernameInput
  });
  //UserNew.save();
  User.find({name: usernameInput}, (err, data)=>{
    if(err){
      console.log(err);
    }
    else{
      idInput = data[data.length - 1]._id;
      console.log(data);
      console.log(idInput);
    }
  });
  res.json({username: usernameInput, _id: idInput});
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
