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
  _id: Number,
  username: {type: String, require: true}
});
const User = mongoose.model("User", UserSchema);
let UserNew;

let usernameInput, idInput;

// pOST TO /api/users with form data username to create new user
const bodyParser = require("body-parser");
// As we need name from input after posting
app.use(bodyParser.urlencoded({extended: false}));
// The response from post is an object with username and _id . For automatically getting id we used mongodb database
app.post("/api/users", (req, res)=>{
  usernameInput = req.body.username;
  // if to check whether input is not blank
  if(usernameInput != ""){
    // To get exact id before saving database
    User.find({_id: {$gte: 0}}, (err, data)=>{
      if(err){
        console.log(err);
      }
      else{
        // if there is data
        if(data.length > 0){
          idInput = data[data.length - 1]._id + 1;
          UserNew = new User({
            _id: idInput,
            username: usernameInput
          });
          UserNew.save();
          // To return response form post
          res.json({username: usernameInput, _id: idInput});
        }
        // if no data
        else{
          idInput = 1;
          UserNew = new User({
            _id: idInput,
            username: usernameInput
          });
          UserNew.save();
          // To return response from post
          res.json({username: usernameInput, _id: idInput});
        }
      }
    });
  }
  // if input is blank
  else{
    res.send("path \'username\' is required")
  }
});

// The return response from post is object with username and _id


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
