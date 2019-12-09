const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const fileupload = require("express-fileupload");
const session = require("express-session");

//This loads all our environment variables from the keys.env
require("dotenv").config({path:'./config/key.env'});
//import your router objects
const userRoutes = require("./routes/User");
const roomRoutes = require("./routes/Room");
//creation of app object
const app = express();

//This tells Express to set Handlebars as template engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
//This is used to make load all static resources
app.use(express.static('public'));
//This is how you map your file upload to express
app.use(fileupload());
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));
//This is used to make load all static resources
app.use(express.static('public'));
app.use(session({secret:"This is my secret key. This should not be shown to everyone"}))
app.use((req,res,next)=>{
    //This is a global variable that can be accessed by templates
    res.locals.user= req.session.userInfo;
    res.locals.admin=req.session.adminInfo;
    next();
})
//Most be above your routes
app.use(bodyParser.urlencoded({ extended: false }))
//MAPs EXPRESS TO ALL OUR  ROUTER OBJECTS
app.use("/user",userRoutes);
app.use("/room",roomRoutes);
const MONGO_DB_URL=`mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0-c9n1w.mongodb.net/${process.env.MONGO_DB_DATABASE_NAME}?retryWrites=true&w=majority`;

//This allows Mongoose to connect to MongoDB
mongoose.connect(MONGO_DB_URL, {useNewUrlParser: true,useUnifiedTopology: true })
.then(()=>{

    console.log(`You have successfully connected to your mongoDB database`);
})
.catch((err)=>{
    console.log(`Sorry, something occured :${err}`);
});

app.get("/", (req,res)=>{
    res.render("General/home");
});

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log("Your Web Server has been connected");
})