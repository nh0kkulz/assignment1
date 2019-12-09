const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const userSchema = new Schema({
    email:
    {
        type: String,
        required: true
    },
    firstname:
    {
        type: String,
        required: true
    },
    lastname:
    {   
        type: String,
        required: true
    },
    password:
    {
        type: String,
        required:true
    },
    dob:
    {
        type: Date,
        required: true
    },
    type:
    {
      type:String,
      default:"User"
    },
    booking:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Room'
    }]
});
//The "pre" mongoose function is going to call the below function right before the document is saved to the DB
userSchema.pre("save",function(next){
    bcrypt.genSalt(10)
    .then(salt=>{
        bcrypt.hash(this.password,salt)
        .then(hash=>{
            this.password=hash
            // The below code is a call back function that does the following :
             //It forces the code of execution to  move onto the next code in the execution queue 
            next();
        })
    })

})

const Users = mongoose.model('users', userSchema);
module.exports = Users;