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

let usernameInput, idInput, descriptionInput, durationInput, dateInput, newSetGet, fromD, toD, limitN;

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
  newSetGet = [];
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
  });
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
      res.json({_id: idInput, username: data.username, date: data.logs[data.logs.length - 1].date, duration: data.logs[data.logs.length - 1].duration, description: data.logs[data.logs.length - 1].description});
    }
  });
});

// To Get request to /api/users/:_id/logs to retrive full exercise log of user
app.get("/api/users/:_id/logs", (req, res)=>{
  newSetGet = [];
  idInput = req.params._id;
  User.findById({_id: idInput}, (err, data)=>{
    if(err){
      console.log(err);
      res.send("NO data");
    }
    else{
      // Response from get request
      fromD = req.query.from;
      toD = req.query.to;
      limitN = req.query.limit;

      //You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
      console.log(fromD);
      console.log(toD);
      console.log(limitN);
      if(fromD || toD || limitN){
        if(limitN){
          console.log("with limit");
          if(limitN > data.logs.length){
            limitN = data.logs.length;
          }
          // i < limitN for newSetGet array
          if(fromD && toD){
            for(i = 0; i < limitN; i++){
              if(new Date(data.logs[i].date).getTime() >= new Date(fromD).getTime() && new Date(data.logs[i].date).getTime() < new Date(toD).getTime()){
                newSetGet.push({
                  description: data.logs[i].description,
                  duration: data.logs[i].duration,
                  date: data.logs[i].date
                });
              }
            }
            res.json({_id: idInput, username: data.username, from: new Date(fromD).toDateString(), to: new Date(toD).toDateString(), count: limitN, log: newSetGet});
          }
          else if(fromD && !toD){
            for(i = 0; i < limitN; i++){
              if(new Date(data.logs[i].date).getTime() >= new Date(fromD).getTime()){
                newSetGet.push({
                  description: data.logs[i].description,
                  duration: data.logs[i].duration,
                  date: data.logs[i].date
                });
              }
            }
            res.json({_id: idInput, username: data.username, from: new Date(fromD).toDateString(), count: limitN, log: newSetGet});
          }
          else if(!fromD && toD){
            for(i = 0; i < limitN; i++){
              if(new Date(data.logs[i].date).getTime() < new Date(toD).getTime()){
                newSetGet.push({
                  description: data.logs[i].description,
                  duration: data.logs[i].duration,
                  date: data.logs[i].date
                });
              }
            }
            res.json({_id: idInput, username: data.username, to: new Date(toD).toDateString(), count: limitN, log: newSetGet});
          }
          else{
            for(i = 0; i < limitN; i++){
              newSetGet.push({
                description: data.logs[i].description,
                duration: data.logs[i].duration,
                date: data.logs[i].date
              });
            }
            res.json({_id: idInput, username: data.username, count: limitN, log: newSetGet});
          }
        }
        else{
          console.log("without limit");
          // i < data.length for newSetGet array
          if(fromD && toD){
            for(i = 0; i < data.logs.length; i++){
              if(new Date(data.logs[i].date).getTime() >= new Date(fromD).getTime() && new Date(data.logs[i].date).getTime() < new Date(toD).getTime()){
                newSetGet.push({
                  description: data.logs[i].description,
                  duration: data.logs[i].duration,
                  date: data.logs[i].date
                });
              }
            }
            res.json({_id: idInput, username: data.username, from: new Date(fromD).toDateString(), to: new Date(toD).toDateString(), count: data.logs.length, log: newSetGet});
          }
          else if(fromD && !toD){
            for(i = 0; i < data.logs.length; i++){
              if(new Date(data.logs[i].date).getTime() >= new Date(fromD).getTime()){
                newSetGet.push({
                  description: data.logs[i].description,
                  duration: data.logs[i].duration,
                  date: data.logs[i].date
                });
              }
            }
            res.json({_id: idInput, username: data.username, from: new Date(fromD).toDateString(), count: data.logs.length, log: newSetGet});
          }
          else if(!fromD && toD){
            for(i = 0; i < data.logs.length; i++){
              if(new Date(data.logs[i].date).getTime() < new Date(toD).getTime()){
                newSetGet.push({
                  description: data.logs[i].description,
                  duration: data.logs[i].duration,
                  date: data.logs[i].date
                });
              }
            }
            res.json({_id: idInput, username: data.username, to: new Date(toD).toDateString(), count: data.logs.length, log: newSetGet});
          }
        }
      }
      else{
        for(i = 0; i < data.logs.length; i++){
          newSetGet.push({
            description: data.logs[i].description,
            duration: data.logs[i].duration,
            date: data.logs[i].date
          });
        }
        res.json({_id: idInput, username: data.username, count: data.logs.length, log: newSetGet});
      }
    }
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
