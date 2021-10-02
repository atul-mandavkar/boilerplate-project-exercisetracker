const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let usernameInput;

// pOST TO /api/users with form data username to create new user
const bodyParser = require("body-parser");
// As we need name from input after posting
app.use(bodyParser.urlencoded({extended: false}));
app.post("/api/users", (req, res)=>{
  usernameInput = req.body.username;
  res.end();
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
